

const express = require('express');
const economy = require('../lib/economy');
const fetch = require('node-fetch');

// Export a router factory so we can pass an external API base URL
const { DISCORD_BOT_TOKEN, GUILD_ID } = process.env;
module.exports = function(EXTERNAL_API_BASE) {
    
    const router = express.Router();

    const externalBase = EXTERNAL_API_BASE || null;
    if (externalBase) console.log('[BlackMarket] External API base set to', externalBase);

    // helper to call external API (returns parsed json or null on error)
    async function callExternal(path, opts = {}) {
        if (!externalBase) return null;
        try {
            const url = externalBase.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
            const res = await fetch(url, opts);
            const text = await res.text();
            try { return JSON.parse(text); } catch(e) { return text; }
        } catch (e) {
            console.warn('[BlackMarket] External call failed', path, e && e.message);
            return null;
        }
    }

// Catálogo completo de BlackMarket con stock
const blackmarketItems = {
    'bm_beretta_m9': { name: 'Beretta M9', price: 4000, stock: 30 },
    'bm_remington_870': { name: 'Remington 870', price: 20000, stock: 15 },
    'bm_ak_47': { name: 'AK-47', price: 195000, stock: 4 },
    'bm_desert_eagle': { name: 'Desert Eagle', price: 15000, stock: 17 },
    'bm_lmt_l129a1': { name: 'LMT_L129A1', price: 125000, stock: 7 },
    'bm_cuchillo_erlc': { name: 'Cuchillo', price: 800, stock: 100 },
    'bm_m249': { name: 'M249', price: 140000, stock: 2 },
    'bm_cafe_magico': { name: 'Cafe con magia', price: 4000, stock: 50 },
    'bm_liberty_weed': { name: 'Plantas Vegetales', price: 1200, stock: 25 },
    'bm_liberty_trip': { name: 'Azucar para el Cafe', price: 2500, stock: 20 },
    'bm_liberty_boost': { name: 'Liberty Boost', price: 1800, stock: 30 },
    'bm_liberty_speed': { name: 'Liberty Speed', price: 3500, stock: 15 },
    'bm_liberty_dream': { name: 'Liberty Dream', price: 5000, stock: 10 },
    'bm_dni_falso_7d': { name: 'DNI FALSO (7 dias)', price: 225000, stock: 5 },
    'bm_eliminar_multa': { name: 'Eliminación 1 multa', price: 50000, stock: 5 },
    'bm_borrar_antecedente': { name: 'Borrar 1 antecedente', price: 120000, stock: 5 },
    'bm_acceso_panel_policia': { name: 'Acceso panel policía', price: 5000000, stock: 1 },
    'bm_dinero_falso': { name: 'Dinero falso', price: 2000, stock: 10 },
    'bm_transferencia_oculta': { name: 'Transferencia oculta', price: 5000, stock: 100 },
    'bm_lavado_dinero': { name: 'Lavado de dinero', price: 9000, stock: 75 },
    'bm_vpn_premium': { name: 'VPN Premium (Irrastreable,ni el CNI)', price: 98000, stock: 15 },
    'bm_movil_seguro': { name: 'Movil seguro (Irrastreable)', price: 12000, stock: 50 },
    'bm_md_anonimos': { name: 'Acceso a mensajes anonimos mediante bot por MD', price: 7000, stock: 60 },
    'bm_root_servidor': { name: 'Acceso info mafia madre', price: 50000, stock: 10 },
    'bm_pistola': { name: 'Pistola', price: 5000, stock: 100 },
    'bm_rifle': { name: 'Rifle', price: 12000, stock: 50 },
    'bm_cuchillo': { name: 'Cuchillo', price: 2000, stock: 200 },
    'bm_cocaina': { name: 'Cocabína', price: 8000, stock: 10 },
    'bm_extasis_2': { name: 'Éxtaxsis', price: 4000, stock: 10 },
    'bm_veneno': { name: 'Veneno ( Sirve para PKT )', price: 6000, stock: 5 },
    'bm_hackeo': { name: 'Hackeo a un usuario', price: 25000, stock: 3 },
    'bm_falsificacion': { name: 'Falsificación documentos', price: 85000, stock: 4 },
    'bm1': { name: 'C4', price: 500, stock: 0 },
    'bm2': { name: 'Llave maestra', price: 300, stock: 0 },
};

const userSales = new Map();


// Venta de inventario a 40% (proxy a API externa)
router.post('/sell', async (req, res) => {
    const result = await callExternal('/api/blackmarket/sell', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});
// Comprar en BlackMarket (proxy a API externa)
router.post('/purchase', async (req, res) => {
    const { userId, itemId } = req.body || {};
    console.log(`[POST] /api/blackmarket/purchase | userId: ${userId}, itemId: ${itemId}, body:`, req.body);
    // Validar datos recibidos
    if (!userId || !itemId) {
        console.error('[PURCHASE] Datos incompletos recibidos:', req.body);
        return res.status(400).json({ error: 'Compra fallida: datos incompletos. Por favor, selecciona un item y asegúrate de estar logueado.' });
    }
    try {
        // Proxy purchase to external API (asegura la ruta correcta y body como JSON)
        const result = await callExternal('/api/blackmarket/purchase', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ userId, itemId })
        });
        if (!result || result.error) {
            console.error('[PURCHASE] Error en la compra:', result && result.error);
            return res.status((result && result.status) || 500).json({ error: (result && result.error) || 'Error en la compra (API externa).' });
        }
        res.json(result);
    } catch (e) {
        console.error('[PURCHASE] Error en la compra (catch):', e);
        res.status(500).json({ error: e.message || 'Error en la compra.' });
    }
});

// Venta de un solo item a 40% (proxy a API externa)
router.post('/sellone', async (req, res) => {
    const result = await callExternal('/api/blackmarket/sellone', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});

// Consultar inventario del usuario (proxy a API externa)
router.get('/inventario/:userId', async (req, res) => {
    const result = await callExternal('/api/blackmarket/inventario/' + req.params.userId);
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});
// Poner item en venta para otros usuarios (verifica inventario en API externa)
router.post('/sell-to-user', async (req, res) => {
    const { sellerId, itemId, amount, price, itemName } = req.body;
    // Verificar inventario del usuario en la API externa
    const inv = await callExternal(`/api/blackmarket/inventario/${sellerId}`);
    if (!inv || !Array.isArray(inv.inventario)) {
        return res.status(500).json({ error: 'No se pudo verificar inventario del usuario.' });
    }
    const invItem = inv.inventario.find(it => it.item_id === itemId);
    if (!invItem || typeof invItem.cantidad !== 'number' || invItem.cantidad < amount) {
        return res.status(400).json({ error: 'No tienes suficiente cantidad en inventario para poner en venta.' });
    }
    if (amount <= 0) {
        return res.status(400).json({ error: 'La cantidad a vender debe ser mayor que cero.' });
    }
    // Primero registrar la venta en la API externa
    const result = await callExternal('/api/blackmarket/sell-to-user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sellerId, itemId, amount, price, itemName })
    });
    if (!result || result.error) {
        return res.status(500).json({ error: 'Error en API externa al registrar venta.' });
    }
    // Solo si la venta se registró correctamente, quitar del inventario
    const removeResult = await callExternal('/api/blackmarket/admin/removeitem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: sellerId, itemId, amount })
    });
    if (!removeResult || removeResult.error) {
        return res.status(500).json({ error: 'No se pudo quitar el item del inventario en la API externa después de registrar la venta.' });
    }
    res.json(result);
});
// Consultar saldo del usuario (proxy a API externa)
router.get('/saldo/:userId', async (req, res) => {
    const result = await callExternal('/api/blackmarket/saldo/' + req.params.userId);
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});
 // Proxy para enviar comprobante de compra
    router.post('/purchase-receipt', async (req, res) => {
        try {
            const { userId, itemId, avatarUrl } = req.body;
            if (!userId || !itemId || !avatarUrl) {
                return res.status(400).json({ error: 'Faltan datos requeridos (userId, itemId, avatarUrl)' });
            }
            const response = await fetch(`${EXTERNAL_API}/api/blackmarket/purchase-receipt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, itemId, avatarUrl })
            });
            const data = await response.json();
            if (!response.ok) return res.status(response.status).json(data);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Error enviando comprobante de compra', details: err.message });
        }
    });

// ADMIN endpoints (proxy a API externa)
router.post('/admin/additem', async (req, res) => {
    console.log('[ADMIN ADDITEM] Request body:', req.body);
    const result = await callExternal('/api/blackmarket/admin/additem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    console.log('[ADMIN ADDITEM] API response:', result);
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});

router.post('/admin/removeitem', async (req, res) => {
    console.log('[ADMIN REMOVEITEM] Request body:', req.body);
    const result = await callExternal('/api/blackmarket/admin/removeitem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    console.log('[ADMIN REMOVEITEM] API response:', result);
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});

router.post('/buy-from-user', async (req, res) => {
    const { buyerId, saleId, amount } = req.body;
    // 1. Registrar la compra en la API externa (esto debe validar saldo y venta)
    const result = await callExternal('/api/blackmarket/buy-from-user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ buyerId, saleId, amount })
    });
    if (!result || result.error) {
        return res.status(500).json({ error: result && result.error ? result.error : 'Error en API externa al registrar compra.' });
    }
    // 2. Añadir el item al inventario del comprador
    if (result.itemId && result.amount && buyerId) {
        const addResult = await callExternal('/api/blackmarket/admin/additem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ userId: buyerId, itemId: result.itemId, amount: result.amount })
        });
        if (!addResult || addResult.error) {
            return res.status(500).json({ error: 'Error al añadir el item al inventario del comprador.' });
        }
    }
    // 3. Quitar el item del inventario del vendedor
    if (result.sellerId && result.itemId && result.amount) {
        const removeResult = await callExternal('/api/blackmarket/admin/removeitem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ userId: result.sellerId, itemId: result.itemId, amount: result.amount })
        });
        if (!removeResult || removeResult.error) {
            return res.status(500).json({ error: 'Error al quitar el item del inventario del vendedor.' });
        }
    }
    res.json({ message: 'Compra realizada correctamente.', ...result });
});

router.get('/sales', async (req, res) => {
    const result = await callExternal('/api/blackmarket/sales');
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});

router.post('/cancel-sale', async (req, res) => {
    // Cancelar venta y devolver item al inventario
    const { saleId, sellerId } = req.body;
    // Obtener datos de la venta cancelada
    const saleData = await callExternal(`/api/blackmarket/sale/${saleId}`);
    let cancelResult = await callExternal('/api/blackmarket/cancel-sale', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req.body)
    });
    if (!cancelResult) return res.status(500).json({ error: 'Error en API externa.' });
    // Si la venta existía, devolver el item al inventario
    if (saleData && saleData.itemId && saleData.amount && sellerId) {
        const addResult = await callExternal('/api/blackmarket/admin/additem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ userId: sellerId, itemId: saleData.itemId, amount: saleData.amount })
        });
        if (!addResult || addResult.error) {
            return res.status(500).json({ error: 'Error al devolver el item al inventario.' });
        }
    }
    res.json(cancelResult);
});


// Consultar catálogo de items (si la API externa falla, devuelve local)
router.get('/items', async (req, res) => {
    let result = null;
    try {
        result = await callExternal('/api/blackmarket/items');
    } catch (e) {
        result = null;
    }
    // Si la API externa no responde o responde 404, usar local
    if (!result || (result.error && String(result.error).includes('404'))) {
        return res.json(blackmarketItems);
    }
    res.json(result);
});

// Consultar inventario de cualquier usuario (proxy a API externa)
router.get('/admin/inventory/:targetUserId', async (req, res) => {
    const userId = req.params.targetUserId;
    console.log(`[ADMIN][INVENTORY][EXTERNAL] Consultando inventario externo de ${userId}`);
    const result = await callExternal(`/api/blackmarket/inventario/${userId}`);
    if (!result || result.error) {
        console.error(`[ADMIN][INVENTORY][EXTERNAL] Error:`, result && result.error);
        return res.status(500).json({ error: result && result.error ? result.error : 'No se pudo consultar el inventario externo' });
    }
    res.json(result);
});

// Consultar saldo de cualquier usuario (proxy a API externa)
router.get('/admin/balance/:targetUserId', async (req, res) => {
    const userId = req.params.targetUserId;
    console.log(`[ADMIN][BALANCE][EXTERNAL] Consultando saldo externo de ${userId}`);
    const result = await callExternal(`/api/blackmarket/saldo/${userId}`);
    if (!result || result.error) {
        console.error(`[ADMIN][BALANCE][EXTERNAL] Error:`, result && result.error);
        return res.status(500).json({ error: result && result.error ? result.error : 'No se pudo consultar el saldo externo' });
    }
    res.json(result);
});
// Gestión de stock (proxy a API externa)
// Modificar stock de un item (local)
router.post('/admin/stock', async (req, res) => {
    console.log('[API] POST /admin/stock', req.body);
    const { itemId, newStock } = req.body;
    if (!itemId || typeof newStock !== 'number' || newStock < 0) {
        console.warn(`[ADMIN][STOCK] Parámetros inválidos:`, req.body);
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    // Proxy a la API externa, usando el formato correcto
    const result = await callExternal('/api/blackmarket/admin/stock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ itemId, newStock })
    });
    console.log('[ADMIN][STOCK] API response:', result);
    if (!result) return res.status(500).json({ error: 'Error en API externa.' });
    res.json(result);
});

// Añadir stock a un item (local)
router.post('/admin/add-stock', (req, res) => {
    console.log('[API] POST /admin/add-stock', req.body);
    const { itemId, amount } = req.body;
    console.log(`[ADMIN][ADD-STOCK] Añadiendo ${amount} unidades a ${itemId}`);
    if (!itemId || typeof amount !== 'number' || amount <= 0) {
        console.warn(`[ADMIN][ADD-STOCK] Parámetros inválidos:`, req.body);
        return res.status(400).json({ error: 'Parámetros inválidos' });
    }
    if (!blackmarketItems[itemId]) {
        console.warn(`[ADMIN][ADD-STOCK] Item ${itemId} no encontrado en BlackMarket`);
        return res.status(404).json({ error: 'Item no encontrado' });
    }
    const oldStock = blackmarketItems[itemId].stock;
    const itemName = blackmarketItems[itemId].name;
    blackmarketItems[itemId].stock += amount;
    const newStock = blackmarketItems[itemId].stock;
    console.log(`[ADMIN][ADD-STOCK] ✅ Se añadieron ${amount} unidades a ${itemName} (${itemId})`);
    console.log(`[ADMIN][ADD-STOCK] Stock: ${oldStock} → ${newStock} (+${amount})`);
    res.json({ 
        success: true, 
        itemId, 
        amountAdded: amount,
        oldStock, 
        newStock: newStock,
        message: `Se añadieron ${amount} unidades. Stock actual: ${newStock}`
    });
});

    // Autocomplete: get all users in the guild (for admin panel)
    router.get('/guild-users', async (req, res) => {
        try {
            if (!DISCORD_BOT_TOKEN || !GUILD_ID) return res.status(500).json({ error: 'Discord bot token or guild ID missing.' });
            const discordRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000`, {
                headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            });
            if (!discordRes.ok) return res.status(500).json({ error: 'Error fetching guild members from Discord.' });
            const members = await discordRes.json();
            // Map to { id, username }
            const users = Array.isArray(members)
                ? members.map(m => ({ id: m.user.id, username: m.user.username }))
                : [];
            res.json({ users });
        } catch (e) {
            res.status(500).json({ error: e.message || 'Error fetching guild users.' });
        }
    });
    // return the configured router
    return router;
};
