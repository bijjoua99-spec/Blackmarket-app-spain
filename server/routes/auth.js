const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Discord OAuth2 configuration
const DISCORD_API = 'https://discord.com/api/v10';
const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  GUILD_ID,
  JWT_SECRET = 'your-secret-key',
  DISCORD_BOT_TOKEN
} = process.env;

// Role IDs from config
const REQUIRED_ROLE_ID = '1426964379588366429'; // BlackMarket access role
const ADMIN_ROLE_ID = '1384340704553205760'; // BlackMarket admin role

// Hardcode the redirect URI to match the client configuration
const DISCORD_REDIRECT_URI = 'https://mercado-negro-spainrp.onrender.com/auth/callback';

router.use(cookieParser());

// Exchange code for Discord tokens and get user data
async function getDiscordUserData(code) {
  console.log('Attempting to exchange code for token with Discord');
  console.log('Using redirect URI:', DISCORD_REDIRECT_URI);
  
  if (!code || typeof code !== 'string' || code.trim().length < 5) {
    throw new Error('El código de autorización de Discord es inválido o está vacío. Intenta iniciar sesión nuevamente.');
  }

  try {
    // Exchange code for access token
    console.log('Token exchange parameters:', {
      client_id: DISCORD_CLIENT_ID,
      code_length: code.length,
      redirect_uri: DISCORD_REDIRECT_URI
    });

    const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code.trim(),
        redirect_uri: DISCORD_REDIRECT_URI,
        scope: 'identify guilds'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error_description || 'Failed to get access token');
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Get user data with access token
    const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { 
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user data');
    }

    const userData = await userResponse.json();

    // Check guild membership
    const guildResponse = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    if (!guildResponse.ok) {
      throw new Error('Failed to verify server membership');
    }
    const guilds = await guildResponse.json();
    const isInGuild = guilds.some(guild => guild.id === GUILD_ID);
    if (!isInGuild) {
      throw new Error('Debes ser miembro del servidor para acceder al BlackMarket');
    }

    // Fetch member roles in the guild
    const memberRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/members/${userData.id}`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    if (!memberRes.ok) {
      throw new Error('No se pudo verificar tus roles en el servidor.');
    }
    const member = await memberRes.json();
    const roles = member.roles || [];
    const hasRequiredRole = roles.includes(REQUIRED_ROLE_ID);
    const isAdmin = roles.includes(ADMIN_ROLE_ID);
    if (!hasRequiredRole) {
      throw new Error('No tienes permisos para acceder al BlackMarket.');
    }

    return {
      ...userData,
      access_token,
      refresh_token,
      isAdmin
    };
  } catch (error) {
    console.error('Error in token exchange:', error);
    throw new Error(error.message || 'Failed to authenticate with Discord');
  }
}

// Discord OAuth2 callback endpoint
router.post('/discord', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Received auth request with code:', code);
    if (!code || typeof code !== 'string' || code.trim().length < 5) {
      console.error('Invalid code received:', code);
      return res.status(400).json({ error: 'El código de autorización de Discord es inválido o está vacío. Intenta iniciar sesión nuevamente.' });
    }

    // Get Discord user data and tokens (with role/guild verification)
    let userData;
    try {
      userData = await getDiscordUserData(code);
      console.log(`[AUTH] Usuario logueado: ${userData.username}#${userData.discriminator} (${userData.id}) | isAdmin: ${userData.isAdmin}`);
    } catch (error) {
      // Permission errors: send 403
      if (
        error.message.includes('No tienes permisos para acceder al BlackMarket') ||
        error.message.includes('Debes ser miembro del servidor para acceder al BlackMarket')
      ) {
        console.log(`[AUTH] Permiso denegado: ${error.message}`);
        return res.status(403).json({ error: error.message });
      }
      // Other errors: send 400
      console.log(`[AUTH] Error de autenticación: ${error.message}`);
      return res.status(400).json({ error: error.message || 'Authentication failed' });
    }

    // Generate our own JWT token that includes Discord tokens
    const token = jwt.sign(
      { 
        userId: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        access_token: userData.access_token,
        refresh_token: userData.refresh_token,
        isAdmin: !!userData.isAdmin // Asegura booleano
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set JWT token in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ 
      token,
      userId: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
      isAdmin: !!userData.isAdmin // Asegura booleano
    });
  } catch (error) {
    console.error('Discord auth error:', error);
    res.status(400).json({ error: error.message || 'Authentication failed' });
  }
});

// Token verification middleware
function verifyToken(req, res, next) {
  const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    
    // Check if Discord token needs refresh (do this every 24h)
    const tokenAge = (Date.now() - (decoded.iat * 1000)) / (1000 * 60 * 60);
    if (tokenAge > 24 && decoded.refresh_token) {
      refreshDiscordToken(decoded.refresh_token)
        .then(newTokens => {
          // Update JWT with new Discord tokens
          const newToken = jwt.sign(
            { 
              ...decoded,
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          // Update cookie
          res.cookie('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
          });
        })
        .catch(console.error); // Don't fail request if refresh fails
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Refresh Discord token
async function refreshDiscordToken(refresh_token) {
  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

// Check auth status endpoint
router.get('/status', verifyToken, (req, res) => {
  res.json({ 
    authenticated: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
      discriminator: req.user.discriminator
    },
    // Propagate isAdmin from the verified token so the frontend can check admin status
    isAdmin: !!req.user.isAdmin
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// Get Discord user data
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userResponse = await fetch(`${DISCORD_API}/users/${userId}`, {
      headers: { 
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user data from Discord');
    }

    const userData = await userResponse.json();
    // Only expose isAdmin for the same authenticated user (do not leak other users' admin flags)
    const isSameUser = req.user && req.user.userId === String(userData.id);
    res.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      isAdmin: isSameUser ? !!req.user.isAdmin : false
    });
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    res.status(500).json({ error: 'Failed to fetch Discord user data' });
  }
});

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { router, verifyToken };