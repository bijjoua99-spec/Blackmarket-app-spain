require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Ensure db folder and users file
const usersFile = path.join(__dirname, 'db', 'users.json');
if (!fs.existsSync(path.join(__dirname, 'db'))) fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify({}));

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8') || '{}');
  } catch (e) {
    return {};
  }
}
function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// Auth: register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readUsers();
  if (users[username]) return res.status(400).json({ error: 'user already exists' });
  const hash = await bcrypt.hash(password, 10);
  // initial structure for economy: cash and bank and empty inventory
  users[username] = {
    id: username,
    password: hash,
    cash: 10000,
    bank: 50000,
    inventory: []
  };
  writeUsers(users);
  res.json({ success: true, userId: username });
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readUsers();
  const u = users[username];
  if (!u) return res.status(400).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, u.password);
  if (!ok) return res.status(400).json({ error: 'invalid credentials' });
  const token = jwt.sign({ userId: username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, userId: username });
});

// Simple middleware to decode token (not enforced for all routes)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'no token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'invalid token' });
  const token = parts[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Mount auth router
const { router: authRouter, verifyToken } = require('./routes/auth');
app.use('/api/auth', authRouter);

// Mount BlackMarket router (router factory accepts external API base)
const EXTERNAL_API = process.env.EXTERNAL_API || process.env.BLACKMARKET_API || 'http://37.27.21.91:5021';
console.log('[CONFIG] EXTERNAL_API =', EXTERNAL_API);
const blackmarketRouter = require('./routes/blackmarket')(EXTERNAL_API);
app.use('/api/blackmarket', blackmarketRouter);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'BlackMarket API running' });
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
