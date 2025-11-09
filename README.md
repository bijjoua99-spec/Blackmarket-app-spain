# BlackMarket (esqueleto)

[![CI](https://github.com/Bijjouspnrp/Bot-Tickets-Gestion-SPAINRP/actions/workflows/ci.yml/badge.svg)](https://github.com/Bijjouspnrp/Bot-Tickets-Gestion-SPAINRP/actions/workflows/ci.yml)

Proyecto inicial que provee:

- Backend Express en `server/` con router `blackmarket` adaptado (módulo de economy mock para desarrollo).
- Frontend minimal en `client/` (Vite + React) con login básico y catálogo.

Objetivo: autenticar usuarios (login básico) y más adelante integrar OAuth2 con Discord para detección de roles.

Siguientes pasos rápidos:

1. Abrir dos terminales (uno para server, otro para client).

2. Server:
   cd server; npm install; npm run start

3. Client:
   cd client; npm install; npm run dev

El servidor corre por defecto en http://localhost:5021 y el frontend en http://localhost:5173 (Vite).

Notas: el backend usa `server/db/users.json` para persistir usuarios/balance/inventario en este esqueleto. Es un mock pensado para desarrollo.
