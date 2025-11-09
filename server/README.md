# BlackMarket Server

Rápido setup local:

1. cd server
2. npm install
3. npm start

Endpoints principales:
- POST /api/auth/register { username, password }
- POST /api/auth/login { username, password }
- GET  /api/blackmarket/items
- POST /api/blackmarket/purchase { userId, itemId }
- etc. (ver `server/routes/blackmarket.js`)

Nota: Este servidor usa `server/db/users.json` como almacenamiento simple para balances/inventarios. Reemplazar por DB real (SQLite/Postgres) en producción.
