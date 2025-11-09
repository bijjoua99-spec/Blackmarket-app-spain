import React, { useEffect, useState, useMemo } from 'react'
import { 
  FaHackerNews, FaPills, FaTools, FaUserSecret, 
  FaMoneyBillWave, FaBoxOpen, FaWarehouse, FaSearch,
} from 'react-icons/fa'
import {
  FaGun, FaPersonRifle, FaKhanda, FaUserShield
} from 'react-icons/fa6'

// Categorization heurística — devuelve etiquetas en Español
function categorize(id, name) {
  const s = (String(id) + ' ' + String(name)).toLowerCase();
  if (/beretta|remington|ak_|desert|m249|pistola|rifle/.test(s)) return 'Armas';
  if (/cuchillo|knife/.test(s)) return 'Cuchillos';
  if (/cafe|weed|cocaina|extasis|veneno|liberty_/.test(s)) return 'Drogas';
  if (/dni|multa|antecedente|panel|falsificacion|eliminar/.test(s)) return 'Servicios';
  if (/vpn|movil|root|hack|md_|anonimos|hackeo/.test(s)) return 'Hackeo';
  if (/dinero|transferencia|lavado/.test(s)) return 'Dinero';
  return 'Otros';
}

function Icon({ name, className = 'w-5 h-5' }){
  const styles = `${className} inline-block align-middle`;
  switch(name){
    case 'Armas': return <FaGun className={styles} />;
    case 'Pistola': return <FaGun className={styles} />;
    case 'Rifle': return <FaPersonRifle className={styles} />;
    case 'Cuchillo': return <FaKnife className={styles} />;
    case 'Drogas': return <FaPills className={styles} />;
    case 'Servicios': return <FaTools className={styles} />;
    case 'Hackeo': return <FaUserSecret className={styles} />;
    case 'Dinero': return <FaMoneyBillWave className={styles} />;
    case 'Otros': return <FaBoxOpen className={styles} />;
    case 'Policia': return <FaUserShield className={styles} />;
    default: return <FaBoxOpen className={styles} />;
  }
}

// Toasts simples
function Toasts({ toasts, onRemove }){
  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded shadow-md text-sm max-w-xs ${t.type === 'ok' ? 'bg-green-700' : 'bg-red-700'}`}> 
          <div className="flex items-center gap-2">
            <strong className="flex-1">{t.title}</strong>
            <button onClick={()=>onRemove(t.id)} className="opacity-80 hover:opacity-100">✕</button>
          </div>
          <div className="text-gray-100 mt-1">{t.msg}</div>
        </div>
      ))}
    </div>
  );
}

// Helper: fetch guild users for autocomplete
async function fetchGuildUsers(apiBase, token) {
  try {
    const res = await fetch(`${apiBase}/api/blackmarket/guild-users`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.users) ? data.users : [];
  } catch (e) {
    return [];
  }
}

// Hacking particles background for market
function HackingParticles({ count = 48 }) {
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

export default function Market({ apiBase, token, userId, onLogout, userData }){
  // ...existing code...
  // Estado para desplegable inventario en mercado entre usuarios
  const [showUserMarketInventory, setShowUserMarketInventory] = useState(false);
  // Mercado entre usuarios
  const [userMarketOpen, setUserMarketOpen] = useState(false);
  const [sellToUserSelected, setSellToUserSelected] = useState(null);
  const [sellToUserAmount, setSellToUserAmount] = useState(1);
  const [sellToUserPrice, setSellToUserPrice] = useState(0);

  // Estado para panel admin flotante
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Abrir modal de mercado entre usuarios
  const openUserMarket = () => {
    fetchInventory();
    setUserMarketOpen(true);
  };
  const closeUserMarket = () => {
    setUserMarketOpen(false);
    setSellToUserSelected(null);
    setSellToUserAmount(1);
    setSellToUserPrice(0);
  };

  // Abrir modal para poner en venta item del inventario
  const openSellToUser = (item) => {
    setSellToUserSelected(item);
    setSellToUserAmount(1);
    setSellToUserPrice(item.precio || 0);
  };
  const closeSellToUser = () => {
    setSellToUserSelected(null);
    setSellToUserAmount(1);
    setSellToUserPrice(0);
  };

  // Poner item en venta para otros usuarios
  const [sellingToUser, setSellingToUser] = useState(false);
  // Bloquear venta si no hay suficiente inventario
  const doSellToUser = async () => {
    if (!sellToUserSelected || !userId) return;
    const invItem = inventory.find(it => it.item_id === sellToUserSelected.id);
    if (!invItem || invItem.cantidad < sellToUserAmount) {
      addToast('Error', `No tienes suficiente cantidad de ${sellToUserSelected.name} en tu inventario para vender (${sellToUserAmount} solicitado, ${invItem ? invItem.cantidad : 0} disponible).`, 'error');
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1a2233] to-[#05060a] text-gray-100 relative overflow-hidden">
          <HackingParticles count={48} />
          {/* Logo BlackMarket arriba si se desea */}
          <img 
            src="/assets/blackmarket.png" 
            alt="BlackMarket" 
            className="w-20 h-20 rounded-full shadow-lg border-4 border-gray-800 bg-gray-900 mt-8 mb-2" 
            style={{objectFit:'cover'}}
          />
          {/* ...rest of the market UI... */}
          {/* Créditos SpainRP abajo */}
          <div className="w-full flex flex-col items-center mt-12 mb-2">
            <img src="/assets/spainrp_navideño.png" alt="SpainRP | Español" className="w-16 h-16 object-contain rounded-full shadow border-2 border-gray-700 mb-1" />
            <span className="text-xs text-gray-400">© SpainRP | Español</span>
          </div>
        </div>
      )
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          sellerId: userId,
          itemId: sellToUserSelected.id,
          itemName: sellToUserSelected.name,
          amount: sellToUserAmount,
          price: sellToUserPrice
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // Mostrar error exacto del backend y loguear en consola
        console.error('[Market] Venta usuario error:', data.error || data);
        addToast('Error', data.error || 'No se pudo poner en venta. Verifica tu inventario.', 'error');
        setSellingToUser(false);
        return;
      }
      addToast('Venta', 'Item puesto en venta correctamente', 'ok');
      // Refrescar inventario desde API
      await fetchInventory();
      // Refrescar ventas activas desde API y mostrar toast si aparece
      try {
        const resSales = await fetch(`${apiBase}/api/blackmarket/sales`);
        const dataSales = await resSales.json();
        setUserSales(dataSales.sales || []);
        // Verificar si la venta aparece en ventas activas
        const found = (dataSales.sales || []).find(s => s.sellerId === userId && s.itemId === sellToUserSelected.id && s.amount === sellToUserAmount);
        if (found) {
          addToast('Venta activa', 'Tu venta está publicada en el mercado entre usuarios.', 'ok');
        }
      } catch (e) {
        setUserSales([]);
      }
      closeSellToUser();
      setUserMarketOpen(true);
    } catch (e) {
      console.error('[Market] Venta usuario error:', e);
      addToast('Error', e.message || 'Error al poner en venta', 'error');
    } finally {
      setSellingToUser(false);
    }
  };
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [discordUser, setDiscordUser] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [userSales, setUserSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [buyUserSale, setBuyUserSale] = useState(null);
  const [buyUserAmount, setBuyUserAmount] = useState(1);

  // Fetch Discord user data and saldo
  useEffect(() => {
    const fetchDiscordUser = async () => {
      try {
        const response = await fetch(`${apiBase}/api/auth/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setDiscordUser(data);
          window.userData = data;
        }
      } catch (error) {
        console.error('Error fetching Discord user:', error);
      }
    };
    const fetchSaldo = async () => {
      try {
        const response = await fetch(`${apiBase}/api/blackmarket/saldo/${userId}`);
        const data = await response.json();
        if (response.ok) setSaldo(data);
      } catch (e) {
        setSaldo(null);
      }
    };
    if (userId && token) {
      fetchDiscordUser();
      fetchSaldo();
    }
  }, [userId, token, apiBase]);
  // Mercado de usuarios: cargar ventas activas
  useEffect(() => {
    const fetchSales = async () => {
      setSalesLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/blackmarket/sales`);
        const data = await res.json();
        setUserSales(data.sales || []);
      } catch (e) {
        setUserSales([]);
      } finally {
        setSalesLoading(false);
      }
    };
    fetchSales();
  }, [apiBase]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [selected, setSelected] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Remove Liberty Speed and Liberty Boost and Cuchillo ERL
  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log('[Market] fetching items from', `${apiBase}/api/blackmarket/items`);
        const response = await fetch(`${apiBase}/api/blackmarket/items`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let data = await response.json();
        // Remove Liberty Speed and Liberty Boost
        if (data && typeof data === 'object') {
          delete data['bm_liberty_speed'];
          delete data['bm_liberty_boost'];
          delete data['bm_cuchillo_erlc'];
        }
        setItems(data || {});
      } catch (e) {
        console.error('[Market] fetch items error:', e);
        addToast('Error', 'No se pudo cargar el catálogo', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [apiBase]);

  // Improved category order and grouping
  const categories = useMemo(() => [
    'Todas',
    'Armas',
    'Cuchillos',
    'Drogas',
    'Servicios',
    'Hackeo',
    'Dinero',
    'Otros',
  ], []);

  const list = useMemo(()=> Object.entries(items).map(([id,it])=>({ id, ...it, categoria: categorize(id, it.name) })),[items]);

  const filtered = useMemo(()=>{
    return list.filter(it => {
      if (category !== 'Todas' && it.categoria !== category) return false;
      if (query && !(it.name.toLowerCase().includes(query.toLowerCase()) || (it.itemId && it.itemId.toLowerCase().includes(query.toLowerCase())) || (it.id && it.id.toLowerCase().includes(query.toLowerCase())))) return false;
      return true;
    });
  },[list, query, category]);

  function addToast(title, msg, type='ok'){
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, title, msg, type: type==='ok'? 'ok':'error' }]);
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 4000);
  }

  function removeToast(id){ setToasts(t => t.filter(x=>x.id!==id)); }

  const [sellSelected, setSellSelected] = useState(null);
  const [sellAmount, setSellAmount] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(1);

  const fetchInventory = async () => {
    if (!userId) return;
    setInventoryLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/blackmarket/inventario/${userId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar inventario');
      setInventory(data.inventario || []);
    } catch (e) {
      console.error('[Market] inventory fetch error:', e);
      addToast('Error', e.message || 'Error al cargar inventario', 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (inventoryOpen) fetchInventory();
  }, [inventoryOpen, userId]);

  const openBuy = (item) => { 
    console.log('[Market] openBuy', item); 
    setSelected(item); 
    setPurchaseAmount(1);
  };
  
  const closeBuy = () => { 
    console.log('[Market] closeBuy'); 
    setSelected(null); 
    setPurchaseAmount(1);
  };

  const openSell = (item) => { 
    console.log('[Market] openSell', item); 
    setSellSelected(item); 
    setSellAmount(1);
  };

  const closeSell = () => { 
    console.log('[Market] closeSell'); 
    setSellSelected(null); 
    setSellAmount(1);
  };

  function getItemIcon(it){
    const id = (it.id || '').toLowerCase();
    const name = (it.name || '').toLowerCase();
    if (id.includes('beretta') || id.includes('pistola') || name.includes('pistola')) return <FaGun className="w-8 h-8 text-red-400" />;
    if (id.includes('ak') || id.includes('rifle') || name.includes('rifle') ) return <FaPersonRifle className="w-8 h-8 text-red-400" />;
    if (id.includes('cuchillo') || name.includes('cuchillo') || id.includes('knife')) return <FaKhanda className="w-8 h-8 text-red-400" />;
    return <Icon name={it.categoria} className="w-8 h-8" />;
  }

  const doPurchase = async (itemId, amount) => {
    // Validar userId y itemId antes de enviar
    if (!userId || !itemId) {
      addToast('Error', 'No se pudo realizar la compra: datos incompletos.', 'error');
      return;
    }
    console.log('[Market] purchase attempt', { userId, itemId, amount });
    try {
      // Purchase items one by one due to API design
      for (let i = 0; i < amount; i++) {
        const res = await fetch(`${apiBase}/api/blackmarket/purchase`, {
          method: 'POST', 
          headers: { 'content-type': 'application/json', ...(token? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ userId: String(userId), itemId: String(itemId) })
        });
        const j = await res.json();
        console.log('[Market] purchase response', { ok: res.ok, body: j });
        if (!res.ok) {
          const msgErr = j && j.error ? j.error : JSON.stringify(j);
          console.error('[Market] purchase failed', msgErr);
          if (i > 0) addToast('Compra parcial', `Se compraron ${i} unidades antes del error: ${String(msgErr)}`, 'error');
          else addToast('Compra fallida', String(msgErr), 'error');
          return;
        }
      }
      // update local stock
      setItems(prev => ({ ...prev, [itemId]: { ...prev[itemId], stock: Math.max(0, (prev[itemId]?.stock||0) - amount) } }));
      addToast('Compra', `Compra de ${amount} unidades realizada correctamente`, 'ok');
      closeBuy();
      // Refresh inventory if it's open
      if (inventoryOpen) fetchInventory();
    } catch (e) {
      console.error('[Market] purchase error', e && e.message);
      addToast('Error', e.message || 'Error en la compra', 'error');
    }
  }

  // Mostrar sección de administrador si el usuario tiene el rol
  // Debug: imprime userData
  console.log('[Market.jsx] userData:', userData);

  // Local admin state: try to derive from prop first, then confirm via protected /status endpoint
  const [localIsAdmin, setLocalIsAdmin] = useState(Boolean(userData && userData.isAdmin));
  useEffect(() => { setLocalIsAdmin(Boolean(userData && userData.isAdmin)); }, [userData]);

  useEffect(() => {
    // If we already know the user is admin from props, skip extra fetch
    if (localIsAdmin) {
      addToast('Bienvenido', 'Bienvenido encargado de facciones ilegales.', 'ok');
      return;
    }
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/auth/status`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const data = await res.json();
        if (!cancelled && res.ok) {
          console.log('[Market.jsx] /status returned', data);
          setLocalIsAdmin(Boolean(data.isAdmin));
          if (data.isAdmin) {
            addToast('Bienvenido', 'Bienvenido encargado de facciones ilegales.', 'ok');
          }
        }
      } catch (e) {
        console.error('[Market.jsx] error fetching /status', e);
      }
    })();
    return () => { cancelled = true; };
  }, [apiBase, token, localIsAdmin]);

  const isAdmin = Boolean(localIsAdmin);
  console.log('[Market.jsx] isAdmin (final):', isAdmin);

  // APIs de administración disponibles
  const adminApis = [
    {
      name: 'Añadir item al inventario',
      endpoint: '/api/blackmarket/admin/additem',
      method: 'POST',
      description: 'Agrega un item al inventario de un usuario.',
      fields: [
        { name: 'userId', label: 'ID de usuario', type: 'text' },
        { name: 'itemId', label: 'ID de item', type: 'text' },
        { name: 'amount', label: 'Cantidad', type: 'number', min: 1 }
      ]
    },
    {
      name: 'Quitar item del inventario',
      endpoint: '/api/blackmarket/admin/removeitem',
      method: 'POST',
      description: 'Elimina un item del inventario de un usuario.',
      fields: [
        { name: 'userId', label: 'ID de usuario', type: 'text' },
        { name: 'itemId', label: 'ID de item', type: 'text' },
        { name: 'amount', label: 'Cantidad', type: 'number', min: 1 }
      ]
    },
    {
      name: 'Modificar stock de item',
      endpoint: '/api/blackmarket/admin/stock',
      method: 'POST',
      description: 'Modifica el stock de un item en el mercado.',
      fields: [
        { name: 'itemId', label: 'ID de item', type: 'text' },
        { name: 'newStock', label: 'Nuevo stock', type: 'number', min: 0 }
      ]
    },
    {
      name: 'Añadir stock a item',
      endpoint: '/api/blackmarket/admin/add-stock',
      method: 'POST',
      description: 'Añade stock adicional a un item.',
      fields: [
        { name: 'itemId', label: 'ID de item', type: 'text' },
        { name: 'amount', label: 'Cantidad a añadir', type: 'number', min: 1 }
      ]
    },
    {
      name: 'Consultar inventario de usuario',
      endpoint: '/api/blackmarket/admin/inventory',
      method: 'GET',
      description: 'Consulta el inventario de cualquier usuario por su ID.',
      fields: [
        { name: 'targetUserId', label: 'ID de usuario', type: 'text' }
      ]
    },
    {
      name: 'Consultar saldo de usuario',
      endpoint: '/api/blackmarket/admin/balance',
      method: 'GET',
      description: 'Consulta el saldo de cualquier usuario por su ID.',
      fields: [
        { name: 'targetUserId', label: 'ID de usuario', type: 'text' }
      ]
    },
  ];

  // Render sección de administrador con formularios interactivos
  function AdminSection() {
    const [formState, setFormState] = useState({});
    const [loadingApi, setLoadingApi] = useState({});
    const [resultApi, setResultApi] = useState({});
    const [guildUsers, setGuildUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [itemsOptions, setItemsOptions] = useState([]);

    // Fetch guild users on mount
    useEffect(() => {
      (async () => {
        const users = await fetchGuildUsers(apiBase, token);
        setGuildUsers(users);
      })();
    }, [apiBase, token]);

    // Update itemsOptions from items list
    useEffect(() => {
      setItemsOptions(list.map(it => ({ value: it.id, label: `${it.name} (${it.id})` })));
    }, [list]);

    // Autocomplete user search
    useEffect(() => {
      if (!userSearch) { setUserOptions([]); return; }
      const q = userSearch.toLowerCase();
      setUserOptions(
        guildUsers.filter(u =>
          u.username.toLowerCase().includes(q) ||
          u.id.includes(q)
        ).slice(0, 10)
      );
    }, [userSearch, guildUsers]);

    function handleChange(apiIdx, field, value) {
      setFormState(fs => ({
        ...fs,
        [apiIdx]: {
          ...fs[apiIdx],
          [field]: value
        }
      }));
    }

    async function handleSubmit(api, apiIdx) {
      if (!isAdmin) return;
      setLoadingApi(l => ({ ...l, [apiIdx]: true }));
      setResultApi(r => ({ ...r, [apiIdx]: null }));
      try {
        let url = `${apiBase}${api.endpoint}`;
        let options = {
          method: api.method,
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        };
        // For inventory and balance GET endpoints, use path param
        if (api.method === 'GET' && (api.endpoint === '/api/blackmarket/admin/inventory' || api.endpoint === '/api/blackmarket/admin/balance')) {
          const userId = formState[apiIdx]?.targetUserId || '';
          url += `/${encodeURIComponent(userId)}`;
        } else if (api.method === 'GET') {
          // Add query params for other GETs
          const params = api.fields.map(f => `${encodeURIComponent(f.name)}=${encodeURIComponent(formState[apiIdx]?.[f.name] || '')}`).join('&');
          url += `?${params}`;
        } else {
          options.body = JSON.stringify(
            api.fields.reduce((acc, f) => {
              acc[f.name] = formState[apiIdx]?.[f.name];
              return acc;
            }, {})
          );
        }
        const res = await fetch(url, options);
        const data = await res.json();
        setResultApi(r => ({ ...r, [apiIdx]: { success: res.ok, data } }));
        if (!res.ok) throw new Error(data?.error || 'Error en la API');
      } catch (e) {
        setResultApi(r => ({ ...r, [apiIdx]: { success: false, data: e.message } }));
      } finally {
        setLoadingApi(l => ({ ...l, [apiIdx]: false }));
      }
    }

    // Categorías para agrupar APIs
    const adminCategories = [
      {
        name: 'Inventario',
        apis: [0, 1], // Añadir/Quitar item
        icon: <FaBoxOpen className="w-5 h-5 text-yellow-400" />
      },
      {
        name: 'Stock',
        apis: [2, 3], // Modificar/Añadir stock
        icon: <FaWarehouse className="w-5 h-5 text-yellow-400" />
      },
      {
        name: 'Consultas',
        apis: [4, 5], // índices de las nuevas APIs
        icon: <FaSearch className="w-5 h-5 text-yellow-400" />
      }
    ];
    const [openCategory, setOpenCategory] = useState(null);

    return (
      <div className="bg-gray-900 border border-yellow-500 rounded-xl shadow-lg p-2 sm:p-4 mt-8 mb-4 w-full max-w-2xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2 sm:mb-4">Panel de Administrador</h2>
        <p className="text-gray-300 mb-2 sm:mb-4 text-xs sm:text-base">Accede a las funciones avanzadas de gestión del BlackMarket. Conectada con la Base de Datos bot principal.</p>
        <div className="flex flex-col gap-2 sm:gap-4">
          {adminCategories.map((cat, catIdx) => (
            <div key={cat.name} className="border border-yellow-700 rounded-lg bg-gray-800">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 text-base sm:text-lg font-semibold text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={() => setOpenCategory(openCategory === catIdx ? null : catIdx)}
                aria-expanded={openCategory === catIdx}
              >
                <span className="flex items-center gap-2">{cat.icon} {cat.name}</span>
                <span>{openCategory === catIdx ? '▲' : '▼'}</span>
              </button>
              {openCategory === catIdx && (
                <div className="p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
                  {cat.apis.map(apiIdx => {
                    const api = adminApis[apiIdx];
                    const result = resultApi[apiIdx];
                    return (
                      <form key={api.endpoint} className="bg-gray-900 rounded-lg p-2 sm:p-4 border border-gray-700 flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleSubmit(api, apiIdx); }}>
                        <h3 className="font-semibold text-yellow-300 mb-1 text-base sm:text-lg">{api.name}</h3>
                        <div className="text-xs sm:text-xs text-gray-400 mb-2">{api.description}</div>
                        <div className="text-xs text-gray-500 mb-2"><span className="font-mono bg-gray-700 px-2 py-0.5 rounded">{api.method}</span> <span className="font-mono">{api.endpoint}</span></div>
                         {api.endpoint === '/api/blackmarket/admin/add-stock' && (
                           <div className="text-xs text-red-400 mb-2 font-semibold">⚠️ Puede haber problemas con esta operación. Si no funciona, revisa los parámetros y la API externa.</div>
                         )}
                        {api.fields.map(f => (
                          <div key={f.name} className="flex flex-col mb-1" style={{ position: 'relative' }}>
                            <label className="text-xs text-gray-300 mb-1">{f.label}</label>
                            {(f.name === 'userId' || f.name === 'targetUserId') ? (
                              <>
                                <input
                                  type="text"
                                  value={formState[apiIdx]?.[f.name] || userSearch}
                                  onChange={e => { setUserSearch(e.target.value); handleChange(apiIdx, f.name, e.target.value); }}
                                  className="p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-100 mb-1 w-full"
                                  placeholder="Buscar usuario por nombre o ID..."
                                  autoComplete="off"
                                  required
                                />
                                {userOptions.length > 0 && (
                                  <div className="bg-gray-900 border border-gray-700 rounded shadow-lg max-h-40 overflow-y-auto z-10 absolute w-full">
                                    {userOptions.map(u => (
                                      <div key={u.id} className="px-2 py-1 text-xs text-gray-100 cursor-pointer hover:bg-gray-800" onClick={() => { handleChange(apiIdx, f.name, u.id); setUserSearch(u.username); setUserOptions([]); }}>
                                        {u.username} <span className="text-gray-400">({u.id})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : f.name === 'itemId' ? (
                              <select
                                value={formState[apiIdx]?.[f.name] || ''}
                                onChange={e => handleChange(apiIdx, f.name, e.target.value)}
                                className="p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-100 w-full"
                                required
                              >
                                <option value="">Selecciona un item...</option>
                                {itemsOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={f.type}
                                min={f.min}
                                value={formState[apiIdx]?.[f.name] || ''}
                                onChange={e => handleChange(apiIdx, f.name, f.type === 'number' ? Math.max(f.min || 0, Number(e.target.value)) : e.target.value)}
                                className="p-2 rounded bg-gray-900 border border-gray-700 text-xs text-gray-100 w-full"
                                required
                              />
                            )}
                          </div>
                        ))}
                        <button type="submit" disabled={loadingApi[apiIdx]} className="mt-2 py-2 px-3 bg-yellow-600 hover:bg-yellow-500 rounded text-xs font-bold text-gray-900 disabled:opacity-60 w-full">{loadingApi[apiIdx] ? 'Procesando...' : 'Ejecutar'}</button>
                        {/* Modern result display for inventory and balance queries */}
                        {result && api.endpoint === '/api/blackmarket/admin/inventory' && result.success && result.data && Array.isArray(result.data.inventario) && (
                          <div className="mt-4 p-4 rounded-xl bg-gray-950 border border-yellow-400 shadow-lg">
                            <h4 className="text-lg font-bold text-yellow-300 mb-2">Inventario consultado</h4>
                            {result.data.inventario.length === 0 ? (
                              <div className="text-gray-400">Este usuario no tiene items en su inventario.</div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {result.data.inventario.map(item => (
                                  <div key={item.item_id} className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                      <span className="font-bold text-base text-yellow-300">{item.nombre}</span>
                                      <span className="text-xs text-gray-400">ID: {item.item_id}</span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <span className="text-sm text-gray-300">Cantidad: <span className="font-bold">{item.cantidad}</span></span>
                                      {item.precio && <span className="text-sm text-green-400">Precio: {Number(item.precio).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {result && api.endpoint === '/api/blackmarket/admin/balance' && result.success && result.data && result.data.balance && (
                          <div className="mt-4 p-4 rounded-xl bg-gray-950 border border-yellow-400 shadow-lg flex flex-col items-start">
                            <h4 className="text-lg font-bold text-yellow-300 mb-2">Saldo consultado</h4>
                            <div className="text-sm text-gray-300 mb-1">ID usuario: <span className="font-mono text-yellow-200">{result.data.userId}</span></div>
                            <div className="flex gap-4 items-center">
                              <span className="text-green-400 font-bold">Efectivo: {Number(result.data.balance.cash).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                              <span className="text-blue-400 font-bold">Banco: {Number(result.data.balance.bank).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                          </div>
                        )}
                        {result && !result.success && (
                          <div className="mt-4 text-red-400 font-semibold">Error: {String(result.data)}</div>
                        )}
                      </form>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-gray-100 bg-fixed bg-cover bg-center relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top left, #0f172a, #05060a 60%)' }}>
      <HackingParticles count={64} />
      <Toasts toasts={toasts} onRemove={removeToast} />
      <div className="w-full px-2 sm:px-4 md:px-8 lg:px-12 xl:px-0 max-w-7xl mx-auto py-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <img src="https://images-ext-1.discordapp.net/external/e3Z03WFaNBwdPgJtddA1agHx2xOciXFVJuUMnFubXX4/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1362092933532090469/8d5856fbffbbc251152714152b2533a3.png?format=png&quality=lossless" alt="BlackMarket" className="w-12 h-12 rounded-full shadow-md" />
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
                  BlackMarket <span className="text-red-500">•</span>
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="px-3 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-700/50 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold overflow-hidden ring-2 ring-purple-500/30">
                      {discordUser?.avatar ? (
                        <img 
                          src={`https://cdn.discordapp.com/avatars/${userId}/${discordUser.avatar}.png?size=128`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{discordUser?.username?.[0] || userId[0]}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-100">
                          {discordUser?.username || 'Usuario'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          #{discordUser?.discriminator || userId.slice(0, 4)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">ID: {userId}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>
                  </div>
                  <div className="px-2 py-0.5 bg-gray-800/50 rounded-full border border-gray-700/50">
                    <span className="text-xs font-medium text-purple-400">{isAdmin ? 'Encargado de facciones ilegales' : 'Miembro'}</span>
                  </div>
                </div>
                {/* Saldo del usuario */}
                <div className="mt-2 flex gap-2 items-center">
                  <span className="text-xs text-gray-400">Saldo:</span>
                  <span className="text-sm font-bold text-green-400 bg-gray-800 px-2 py-1 rounded">{saldo ? `${Number(saldo.cash).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} efectivo / ${Number(saldo.bank).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} banco` : 'Cargando...'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setInventoryOpen(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded shadow flex items-center gap-2">
              <FaWarehouse className="w-4 h-4" />
              <span>Inventario</span>
            </button>
            {isAdmin && (
              <button onClick={()=>setAdminPanelOpen(true)} className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded shadow flex items-center gap-2">
                <FaTools className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            )}
            <button onClick={openUserMarket} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded shadow flex items-center gap-2">
              <FaUserSecret className="w-4 h-4" />
              <span>Mercado entre usuarios</span>
            </button>
        {/* Modal flotante moderno para Mercado entre usuarios */}
        {userMarketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-3xl bg-gray-950 border border-gray-800 p-8 rounded-2xl shadow-2xl relative">
              <button onClick={closeUserMarket} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl">✕</button>
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                <FaUserSecret className="w-7 h-7" /> Mercado entre usuarios
              </h2>
              <div className="mb-6 text-gray-400 text-sm">Compra y vende items directamente con otros usuarios. Solo puedes vender items que tienes en tu inventario.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Listar ventas activas */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ventas activas</h3>
                  <div className="mb-2 text-gray-500 text-xs italic">Aquí aparecen los items que los usuarios han puesto en venta. Puedes comprar o cancelar tus propias ventas.</div>
                  {salesLoading ? (
                    <div className="text-gray-400">Cargando ventas...</div>
                  ) : userSales.length === 0 ? (
                    <div className="text-gray-400">No hay ventas activas.</div>
                  ) : (
                    <div className="space-y-4">
                      {userSales.map(sale => (
                        <div key={sale.saleId} className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-red-400">{sale.itemName}</span>
                            <span className="text-xs text-gray-400">ID: {sale.itemId}</span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <span className="text-sm text-gray-300">Vendedor: <span className="font-mono text-purple-400">{sale.sellerId}</span></span>
                            <span className="text-sm text-gray-300">Cantidad: <span className="font-bold">{sale.amount}</span></span>
                            <span className="text-sm text-green-400">Precio: {Number(sale.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={()=>{setBuyUserSale(sale);setBuyUserAmount(1);}} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-md">Comprar</button>
                            {sale.sellerId === userId && (
                              <button onClick={async ()=>{
                                // Cancelar venta propia
                                try{
                                  const res = await fetch(`${apiBase}/api/blackmarket/cancel-sale`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                    body: JSON.stringify({ saleId: sale.saleId, sellerId: userId })
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.error || 'Error al cancelar venta');
                                  addToast('Venta', 'Venta cancelada correctamente. El item ha sido devuelto a tu inventario.', 'ok');
                                  // Actualizar ventas
                                  setUserSales(us => us.filter(s => s.saleId !== sale.saleId));
                                  // Refrescar inventario desde API
                                  await fetchInventory();
                                }catch(e){ addToast('Error', e.message || 'Error al cancelar venta', 'error'); }
                              }} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Poner item en venta */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Poner item en venta</h3>
                  <div className="mb-2 text-gray-400 text-xs">Solo puedes vender items que tienes en tu inventario.</div>
                  <div className="mb-2 text-gray-500 text-xs italic">Selecciona un item y ponlo en venta para otros usuarios. El item se quitará de tu inventario hasta que se venda o canceles la venta.</div>
                  {/* Desplegable y responsive inventario */}
                  <div className="mb-2">
                    <button
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs mb-2"
                      onClick={() => setShowUserMarketInventory(v => !v)}
                    >
                      {showUserMarketInventory ? 'Ocultar inventario ▲' : 'Mostrar inventario ▼'}
                    </button>
                  </div>
                  {showUserMarketInventory && (
                    <div className="max-h-64 overflow-y-auto space-y-2 transition-all duration-300 ease-in-out">
                      {inventory.length === 0 ? (
                        <div className="text-gray-400">No tienes items en inventario.</div>
                      ) : (
                        inventory.map(item => (
                          <div key={item.item_id} className="bg-gray-900 p-3 rounded flex items-center gap-3 border border-gray-800">
                            <div className="w-10 h-10 rounded bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-xl text-red-400">
                              {getItemIcon(item)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.nombre}</div>
                              <div className="text-xs text-gray-500 truncate">ID: {item.item_id}</div>
                              <div className="text-xs text-gray-400">Cantidad: {item.cantidad}</div>
                            </div>
                            <button onClick={()=>openSellToUser({ id: item.item_id, name: item.nombre, precio: item.precio })} className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs">Vender</button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {/* Modal para poner en venta */}
                  {sellToUserSelected && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
                      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl relative">
                        <button onClick={closeSellToUser} className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-xl">✕</button>
                        <h3 className="text-xl font-bold mb-2">Poner en venta: {sellToUserSelected.name}</h3>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-300 mb-2">Cantidad a vender</label>
                          <input
                            type="number"
                            min={1}
                            max={(() => {
                              const invItem = inventory.find(it => it.item_id === sellToUserSelected.id);
                              return invItem ? invItem.cantidad : 1;
                            })()}
                            value={sellToUserAmount}
                            onChange={e => {
                              const invItem = inventory.find(it => it.item_id === sellToUserSelected.id);
                              const maxQty = invItem ? invItem.cantidad : 1;
                              setSellToUserAmount(Math.min(maxQty, Math.max(1, Number(e.target.value || 1))));
                            }}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            disabled={sellingToUser}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-300 mb-2">Precio unitario (€)</label>
                          <input
                            type="number"
                            min={1}
                            value={sellToUserPrice}
                            onChange={e => setSellToUserPrice(Math.max(1, Number(e.target.value || 1)))}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                            disabled={sellingToUser}
                          />
                          <div className="text-xs text-gray-400 mt-1">Total: {Number(sellToUserPrice * sellToUserAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={doSellToUser}
                            className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 rounded-md"
                            disabled={sellingToUser || (() => {
                              const invItem = inventory.find(it => it.item_id === sellToUserSelected.id);
                              return !invItem || invItem.cantidad < sellToUserAmount;
                            })()}
                          >
                            {sellingToUser ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
                                Publicando venta...
                              </span>
                            ) : (
                              <>Confirmar venta ({sellToUserAmount}x)</>
                            )}
                          </button>
                          <button onClick={closeSellToUser} className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md" disabled={sellingToUser}>Cancelar</button>
                        </div>
                        {/* Mensaje de error si no hay suficiente inventario */}
                        {sellToUserSelected && (() => {
                          const invItem = inventory.find(it => it.item_id === sellToUserSelected.id);
                          if (!invItem || invItem.cantidad < sellToUserAmount) {
                            return (
                              <div className="mt-2 text-red-400 text-sm font-semibold">
                                No tienes suficiente cantidad en inventario para vender ({sellToUserAmount} solicitado, {invItem ? invItem.cantidad : 0} disponible).
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
            <button onClick={onLogout} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded shadow">Salir</button>
          </div>
        </header>
        {/* Mercado de usuarios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><FaUserSecret className="w-5 h-5" /> Mercado de usuarios</h2>
          {salesLoading ? (
            <div className="text-gray-400">Cargando ventas de usuarios...</div>
          ) : userSales.length === 0 ? (
            <div className="text-gray-400">No hay ventas activas de usuarios.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userSales.map(sale => (
                <div key={sale.saleId} className="bg-gray-800 p-4 rounded-lg flex flex-col gap-2 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-red-400">{sale.itemName}</span>
                    <span className="text-xs text-gray-400">ID: {sale.itemId}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-sm text-gray-300">Vendedor: <span className="font-mono text-purple-400">{sale.sellerId}</span></span>
                    <span className="text-sm text-gray-300">Cantidad: <span className="font-bold">{sale.amount}</span></span>
                    <span className="text-sm text-green-400">Precio: {Number(sale.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>{setBuyUserSale(sale);setBuyUserAmount(1);}} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-md">Comprar</button>
                    {sale.sellerId === userId && (
                      <button onClick={async ()=>{
                        // Cancelar venta propia
                        try{
                          const res = await fetch(`${apiBase}/api/blackmarket/cancel-sale`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sellerId:userId,saleId:sale.saleId})});
                          const j = await res.json();
                          if(res.ok){addToast('Venta cancelada',j.message,'ok');setUserSales(s=>s.filter(x=>x.saleId!==sale.saleId));}else{addToast('Error',j.error||'No se pudo cancelar','error');}
                        }catch(e){addToast('Error',e.message||'No se pudo cancelar','error');}
                      }} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md">Cancelar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Modal para comprar a usuario */}
        {buyUserSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-2">Comprar a usuario</h3>
              <p className="text-sm text-gray-400 mb-2">{buyUserSale.itemName} — Vendedor: <span className="font-mono text-purple-400">{buyUserSale.sellerId}</span></p>
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Cantidad a comprar</label>
                <input type="number" min={1} max={buyUserSale.amount} value={buyUserAmount} onChange={e=>setBuyUserAmount(Math.min(buyUserSale.amount,Math.max(1,parseInt(e.target.value||'1',10))))} className="w-24 p-2 rounded bg-gray-800 border border-gray-700 text-center" />
                <span className="text-sm text-gray-400 ml-2">Total: {Number(buyUserSale.price*buyUserAmount).toLocaleString('es-ES',{style:'currency',currency:'EUR'})}</span>
              </div>
              <div className="mt-4 flex gap-2">
                  <button onClick={async ()=>{
                    try {
                      const res = await fetch(`${apiBase}/api/blackmarket/buy-from-user`, {
                        method: 'POST',
                        headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify({ buyerId: userId, saleId: buyUserSale.saleId, amount: buyUserAmount })
                      });
                      const j = await res.json();
                      if (res.ok) {
                        addToast('Compra usuario', j.message, 'ok');
                        setBuyUserSale(null);
                        // Refrescar ventas activas desde API
                        try {
                          const resSales = await fetch(`${apiBase}/api/blackmarket/sales`);
                          const dataSales = await resSales.json();
                          setUserSales(dataSales.sales || []);
                        } catch (e) {
                          setUserSales([]);
                        }
                        // Refrescar inventario desde API
                        await fetchInventory();
                      } else {
                        addToast('Error', j.error || 'No se pudo comprar', 'error');
                      }
                    } catch (e) {
                      addToast('Error', e.message || 'No se pudo comprar', 'error');
                    }
                  }} className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-md">Confirmar compra</button>
                <button onClick={()=>setBuyUserSale(null)} className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <section className="mb-6 flex gap-4 items-center">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar items por nombre o id..." className="flex-1 p-3 rounded bg-gray-900 border border-gray-800 placeholder-gray-500" />
          <div className="flex gap-2 overflow-auto">
            {categories.map(c => (
              <button key={c} onClick={()=>setCategory(c)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${category===c? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg':'bg-gray-800 hover:bg-gray-700'}`}>
                <Icon name={c} className="w-4 h-4" />
                <span className="text-sm">{c}</span>
              </button>
            ))}
          </div>
        </section>

        <main>
          {loading && <div className="text-gray-400">Cargando catálogo...</div>}
          {!loading && filtered.length === 0 && <div className="text-gray-400">No se encontraron items.</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(it => (
              <article key={it.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-md transform hover:-translate-y-1 transition">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-2xl text-red-400">
                    {getItemIcon(it)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{it.name}</h3>
                    <div className="text-xs text-gray-500">{it.id}</div>
                    <div className="text-xs text-gray-400 mt-2">Categoría: <span className="font-medium">{it.categoria}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold text-lg">{Number(it.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                    <div className={`text-sm mt-1 ${it.stock>0? 'text-gray-300':'text-red-500'}`}>Stock: {it.stock}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={()=>openBuy(it)} disabled={it.stock<=0} className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${it.stock>0? 'bg-red-600 hover:bg-red-500':'bg-gray-800 cursor-not-allowed'}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Comprar</span>
                  </button>
                  {/* Vender button removed for main market */}
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Purchase Modal */}
        {selected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-2">Confirmar compra</h3>
              <p className="text-sm text-gray-400 mb-4">{selected.name} — Precio: {Number(selected.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Cantidad a comprar</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={selected.stock}
                    value={purchaseAmount}
                    onChange={e => setPurchaseAmount(Math.min(selected.stock, Math.max(1, Number(e.target.value || 1))))}
                    className="w-24 p-2 rounded bg-gray-800 border border-gray-700 text-center"
                  />
                  <span className="text-sm text-gray-400">
                    Total: {Number(selected.price * purchaseAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => doPurchase(selected.id, purchaseAmount)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-md flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Confirmar ({purchaseAmount})</span>
                </button>
                <button onClick={closeBuy} className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Sell modal */}
        {sellSelected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-2">Vender: {sellSelected.name}</h3>
              <p className="text-sm text-gray-400">Venderás al <span className="font-bold text-yellow-400">40%</span> del precio original.<br/>Precio unitario: <span className="font-bold">{Number(Math.floor((sellSelected.price||0)*0.4)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></p>
              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">Cantidad a vender</label>
                <input
                  type="number"
                  min={1}
                  max={(() => {
                    const invItem = inventory.find(it => it.item_id === sellSelected.id);
                    return invItem ? invItem.cantidad : 1;
                  })()}
                  value={sellAmount}
                  onChange={e => {
                    const invItem = inventory.find(it => it.item_id === sellSelected.id);
                    const maxQty = invItem ? invItem.cantidad : 1;
                    setSellAmount(Math.min(maxQty, Math.max(1, Number(e.target.value || 1))));
                  }}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={async ()=>{
                  try{
                    const res = await fetch(`${apiBase}/api/blackmarket/sellone`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ userId, itemId: sellSelected.id, amount: sellAmount }) });
                    const j = await res.json();
                    if (!res.ok) { addToast('Venta fallida', j.error || JSON.stringify(j), 'error'); return; }
                    addToast('Venta', `Vendiste ${sellAmount}x ${sellSelected.name} por ${Number(Math.floor((sellSelected.price||0)*0.4)*sellAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} (40%)`, 'ok');
                    closeSell();
                  }catch(e){ console.error('sell error', e); addToast('Error', e.message||'Error en venta','error'); }
                }} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md">
                  Confirmar venta ({sellAmount}x)<br/>
                  <span className="text-xs text-gray-900 font-bold">Total: {Number(Math.floor((sellSelected.price||0)*0.4)*sellAmount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                </button>
                <button onClick={closeSell} className="py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Modal */}
        {inventoryOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaWarehouse className="w-5 h-5" />
                  <span>Tu Inventario</span>
                </h3>
                <button onClick={() => setInventoryOpen(false)} className="text-gray-400 hover:text-gray-300">✕</button>
              </div>

              <div className="flex-1 overflow-auto min-h-0">
                {inventoryLoading ? (
                  <div className="text-gray-400 text-center py-8">Cargando inventario...</div>
                ) : inventory.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">No tienes items en tu inventario</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {inventory.map((item, i) => (
                      <div key={item.item_id + i} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xl text-red-400">
                            {getItemIcon(item)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{item.nombre}</h4>
                            <div className="text-xs text-gray-500">{item.item_id}</div>
                            <div className="text-sm text-gray-400 mt-1">
                              Cantidad: <span className="font-medium">{item.cantidad}</span>
                            </div>
                            {item.precio && (
                              <div className="text-sm text-gray-400">
                                Valor unitario: <span className="font-medium">{Number(item.precio).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                              </div>
                            )}
                          </div>
                          {item.precio && (
                            <div className="text-right">
                              <div className="text-red-400 font-bold">
                                {Number(item.precio * item.cantidad).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                              </div>
                              <div className="text-xs text-gray-500">Valor total</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => { 
                              setInventoryOpen(false);
                              openSell({ id: item.item_id, name: item.nombre, price: item.precio });
                            }}
                            className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Vender</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={fetchInventory} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal flotante para panel admin */}
      {isAdmin && adminPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-2xl bg-gray-950 border border-yellow-500 p-8 rounded-2xl shadow-2xl relative">
            <button onClick={()=>setAdminPanelOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl">✕</button>
            <AdminSection />
          </div>
        </div>
      )}
    </div>
  )
}
