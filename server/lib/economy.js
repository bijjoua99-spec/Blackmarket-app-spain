const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, '..', 'db', 'users.json');

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

// Callbacks style to match the provided router
module.exports = {
  getBalance: (userId, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(null, { cash: 0, bank: 0 });
    return cb(null, { cash: u.cash || 0, bank: u.bank || 0 });
  },
  getInventory: (userId, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(null, []);
    return cb(null, u.inventory || []);
  },
  addItem: (userId, itemId, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    u.inventory = u.inventory || [];
    const it = u.inventory.find(i => i.item_id === itemId);
    if (it) it.cantidad += 1; else u.inventory.push({ item_id: itemId, cantidad: 1 });
    writeUsers(users);
    cb(null);
  },
  removeItem: (userId, itemId, amount, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    u.inventory = u.inventory || [];
    const idx = u.inventory.findIndex(i => i.item_id === itemId);
    if (idx === -1) return cb(new Error('item not found'));
    if (u.inventory[idx].cantidad < amount) return cb(new Error('not enough items'));
    u.inventory[idx].cantidad -= amount;
    if (u.inventory[idx].cantidad <= 0) u.inventory.splice(idx, 1);
    writeUsers(users);
    cb(null);
  },
  removeItems: (userId, items, cb) => {
    // items: [{ itemId, amount }]
    try {
      const users = readUsers();
      const u = users[userId];
      if (!u) return cb(new Error('user not found'));
      u.inventory = u.inventory || [];
      for (const it of items) {
        const idx = u.inventory.findIndex(i => i.item_id === it.itemId);
        if (idx === -1 || u.inventory[idx].cantidad < it.amount) return cb(new Error('not enough items'));
      }
      // apply changes
      for (const it of items) {
        const idx = u.inventory.findIndex(i => i.item_id === it.itemId);
        u.inventory[idx].cantidad -= it.amount;
        if (u.inventory[idx].cantidad <= 0) u.inventory.splice(idx, 1);
      }
      writeUsers(users);
      cb(null);
    } catch (e) {
      cb(e);
    }
  },
  addMoney: (userId, amount, reason, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    u.bank = (u.bank || 0) + amount;
    writeUsers(users);
    cb(null);
  },
  removeMoney: (userId, amount, reason, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    u.cash = (u.cash || 0) - amount;
    if (u.cash < 0) u.cash = 0;
    writeUsers(users);
    cb(null);
  },
  withdraw: (userId, amount, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    if ((u.bank || 0) < amount) return cb(new Error('not enough bank'));
    u.bank -= amount;
    writeUsers(users);
    cb(null);
  },
  setBalance: (userId, cash, bank, cb) => {
    const users = readUsers();
    const u = users[userId];
    if (!u) return cb(new Error('user not found'));
    if (typeof cash === 'number') u.cash = cash;
    if (typeof bank === 'number') u.bank = bank;
    writeUsers(users);
    cb(null);
  }
};
