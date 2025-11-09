import React, { useState, useEffect } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { DISCORD_CONFIG } from '../config/discord';
import { Toaster, toast } from 'react-hot-toast';

// Hacking particles background for login
function HackingParticles({ count = 40 }) {
  const particles = Array.from({ length: count });
  return (
    <div className="hacking-particles">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2.5;
        const duration = 2 + Math.random() * 2.5;
        return (
          <div
            key={i}
            className="hacking-particle"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Login({ apiBase, onLogin }){
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Check if we have a code from Discord OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log('Received Discord auth code:', code);
      handleDiscordCallback(code);
    }
  }, []);

  const handleDiscordLogin = () => {
    // State parameter for security
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('discord_auth_state', state);
    
    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      redirect_uri: DISCORD_CONFIG.redirectUri,
      response_type: 'code',
      scope: DISCORD_CONFIG.scope,
      state: state
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params}`;
  };

  const handleDiscordCallback = async (code) => {
    setLoading(true);
    setErr(null);
    
    try {
      const res = await fetch(`${apiBase}/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Show success toast with admin badge if applicable
      toast.success(
        <div className="flex items-center space-x-4 p-2">
          <div className="flex-shrink-0 relative">
            {data.avatar ? (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 animate-pulse" style={{ padding: '2px' }}>
                  <div className="w-full h-full rounded-full bg-gray-900"></div>
                </div>
                <img 
                  src={data.avatar} 
                  alt="" 
                  className="w-12 h-12 rounded-full border-2 border-gray-800 shadow-lg relative z-10"
                  style={{ boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)' }}
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full z-20"></div>
              </>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {data.username[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-bold text-green-400 text-lg tracking-tight">
                ¡Bienvenido al Mercado Clandestino!
              </p>
              <div className="px-2 py-0.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                <span className="text-xs font-medium text-gray-400">Verificado</span>
              </div>
              {data.isAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400">Administrador</span>
              )}
            </div>
            <div className="flex flex-col text-sm gap-0.5">
              <p className="text-gray-300 font-medium">
                {data.username}
                <span className="text-gray-500">#{data.discriminator}</span>
              </p>
              <p className="text-gray-400 font-mono text-xs">
                ID: {data.userId}
              </p>
            </div>
            <div className="mt-1 flex gap-2">
              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-400">
                Miembro
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-400">
                BlackMarket
              </span>
            </div>
          </div>
        </div>,
        {
          duration: 5000,
          position: 'top-right',
          className: 'bg-gray-900/95 border border-gray-800 rounded-lg shadow-xl backdrop-blur-sm p-2'
        }
      );
      onLogin({ 
        token: data.token, 
        userId: data.userId,
        username: data.username,
        discriminator: data.discriminator,
        avatar: data.avatar,
        isAdmin: data.isAdmin
      });
    } catch (e) {
      setErr(e.message);
      setLoading(false);
      // Custom error for missing role
      let customMsg = null;
      const msg = String(e.message);
      if (msg.includes('No tienes permisos para acceder al BlackMarket')) {
        customMsg = (
          <div className="text-red-400">
            <p className="font-bold mb-1">No tienes permisos para acceder al BlackMarket.</p>
            <p className="text-sm mb-2">Debes tener el rol <span className="font-bold text-yellow-400">Organización Criminal</span> en el servidor de SpainRP.</p>
            <div className="mb-2 text-xs text-gray-300">Si crees que es un error, contacta soporte en los siguientes servidores:</div>
            <div className="flex flex-col gap-1">
              <a href="https://discord.gg/C5jGen3hVt" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">Mercado Negro</a>
              <a href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" className="underline text-purple-400 hover:text-purple-300">SpainRP</a>
            </div>
          </div>
        );
      } else if (
        msg.includes('Invalid "code" in request') ||
        msg.includes('El código de autorización de Discord es inválido')
      ) {
        customMsg = (
          <div className="text-red-400">
            <p className="font-bold mb-1">Error de autenticación con Discord</p>
            <p className="text-sm mb-2">El código de autorización de Discord es inválido o ha expirado.</p>
            <p className="text-xs text-gray-300 mb-2">Por favor, vuelve a iniciar sesión desde el botón "Continuar con Discord".</p>
            <div className="flex flex-col gap-1">
              <a href="https://discord.gg/C5jGen3hVt" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">Mercado Negro</a>
              <a href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" className="underline text-purple-400 hover:text-purple-300">SpainRP</a>
            </div>
          </div>
        );
      }
      toast.dismiss();
      toast.error(
        customMsg || (
          <div className="text-red-400">
            <p className="font-medium">Error de autenticación</p>
            <p className="text-sm">{e.message}</p>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-right',
          className: 'bg-gray-800 border border-red-800'
        }
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1a2233] to-[#05060a] text-gray-100 relative overflow-hidden">
      <HackingParticles count={48} />
      <Toaster 
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(17, 24, 39, 0.95)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
          },
        }}
      />
      <div className="w-full max-w-2xl mx-auto mt-8 mb-4 px-2 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 mb-8 w-full">
          <img 
            src="https://images-ext-1.discordapp.net/external/e3Z03WFaNBwdPgJtddA1agHx2xOciXFVJuUMnFubXX4/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1362092933532090469/8d5856fbffbbc251152714152b2533a3.png?format=png&quality=lossless" 
            alt="BlackMarket" 
            className="w-24 h-24 rounded-full shadow-lg border-4 border-gray-800 bg-gray-900"
          />
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg text-center">BlackMarket</h1>
          <span className="px-3 py-1 bg-gray-800/80 rounded-full border border-gray-700/50 text-xs font-semibold text-purple-400 shadow text-center">Página oficial asociada a SpainRP</span>
        </div>
        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 w-full">
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Bienvenido al Mercado Negro</h2>
            <p className="text-gray-300 text-base mb-2">Compra y vende <span className="font-bold">armas</span>, <span className="font-bold">sustancias</span>, <span className="font-bold">servicios ilegales</span> y mucho más. Plataforma oficial y segura para miembros de <span className="font-bold text-purple-400">SpainRP</span>.</p>
            <p className="text-gray-400 text-sm">Accede con tu cuenta de Discord y disfruta de todas las ventajas del mercado clandestino.</p>
          </div>
          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#5865F2] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDiscord className="w-6 h-6" />
            <span>{loading ? 'Conectando...' : 'Entrar con Discord'}</span>
          </button>
          {err && (
            <div className="mt-2 p-3 bg-red-900/60 border border-red-800 rounded-md text-red-400 text-sm text-center">
              {err}
            </div>
          )}
          <div className="flex flex-col gap-2 mt-4">
            <a href="https://discord.gg/C5jGen3hVt" target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-blue-900 hover:bg-blue-800 rounded-lg text-blue-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              <span>Mercado Negro Discord</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a href="https://discord.gg/sMzFgFQHXA" target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-purple-900 hover:bg-purple-800 rounded-lg text-purple-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all">
              <span>SpainRP Discord</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center mt-8 mb-4 w-full">
          <img src="https://media.discordapp.net/attachments/1361435347321487360/1437108873499775067/a_752c3fdbe8ff0b685348c5ae7c1b51de_1.png?ex=69120b6f&is=6910b9ef&hm=ced5f4f26f473271afb679ed38da6b004f6dcc98471ee78b3c184de8ced4a33f&=&format=png&quality=lossless" alt="SpainRP | Español" className="w-32 h-32 object-contain rounded-full shadow-lg border-2 border-gray-700" />
          <span className="mt-2 text-xs text-gray-400">© SpainRP | Español</span>
        </div>
        {/* Creditos y contacto desplegable */}
        <div className="w-full flex flex-col items-center justify-center mt-4">
          <details className="w-full max-w-md mx-auto bg-gray-900/90 border border-gray-800 rounded-xl shadow-lg p-5 flex flex-col items-center gap-3 transition-all duration-200">
            <summary className="flex items-center gap-3 cursor-pointer outline-none text-base font-bold text-purple-400">
              <img src="https://media.discordapp.net/attachments/1361435347321487360/1437127316567228641/spain_rp_logo-removebg.png?ex=69121c9c&is=6910cb1c&hm=c2cf7fb1178092627cfbb263b8d2028111d248c77aa2331f6b673175e93664fc&=&format=png&quality=lossless" alt="BijjouPro08" className="w-10 h-10 rounded-full border-2 border-purple-500 shadow" />
              <span>Sobre el fundador: <span className="text-white">BijjouPro08</span></span>
            </summary>
            <div className="w-full flex flex-col items-center mt-3">
              <div className="text-center mb-2">
                <span className="font-bold text-purple-400 text-lg">Fundador y desarrollador principal</span>
                <span className="block text-white font-semibold text-base mt-1">SpainRP | BijjouPro08</span>
              </div>
              <div className="text-gray-300 text-sm text-center mb-2">
                Esta plataforma ha sido creada con dedicación y pasión para la comunidad de SpainRP.<br />
                El objetivo es ofrecer un mercado seguro, moderno y exclusivo para todos los miembros.
              </div>
              <div className="text-xs text-gray-400 text-center mb-2">
                <span className="font-bold text-yellow-400">Estado actual:</span> Beta pública.<br />
                Si encuentras algún error o tienes sugerencias, puedes contactar directamente.
              </div>
              <a href="https://portafolio-bijjoupro08.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-xs text-white font-semibold shadow">Ver portafolio profesional</a>
              <span className="text-xs text-gray-400 mt-2">Contacto directo: Discord <span className="font-mono text-purple-300">BijjouPro08</span> o a través del portafolio.</span>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
