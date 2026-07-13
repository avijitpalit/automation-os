# Automation OS

A WordPress plugin that renders its admin page using a React app built with Vite.

## Structure
- `automation-os.php` — main plugin file. Registers the "Automation OS" admin menu page, and serves the UI in one of two modes (see below).
- `assets/build/` — production-ready `main.js` / `main.css` (already built, ready to use as-is).
- `app/` — Vite + React source code. Edit this to change the UI.

## Installing
1. Copy the `automation-os` folder into `wp-content/plugins/`.
2. Activate "Automation OS" in Plugins.
3. Find "Automation OS" in the left admin menu.

## Two ways to run it

**Production (default)** — no setup needed. WordPress serves the pre-built
`assets/build/main.js` / `main.css`. This is what ships when you deploy.

**Dev mode (instant HMR)** — for active development, so edits in `app/src`
show up immediately without rebuilding:

1. In `wp-config.php`, add:
   ```php
   define( 'AOS_DEV_MODE', true );
   ```
2. In `automation-os/app`:
   ```bash
   npm install
   npm run dev
   ```
3. Reload the WP admin page. It now loads directly from the Vite dev
   server at `http://localhost:5173` with hot reload.

   If your WP site isn't on `localhost` (e.g. `helloworld.lvh.me`, a custom
   domain, etc.), update `server.cors.origin` in `app/vite.config.js` to
   match your site's exact origin, and restart `npm run dev` after changing it.

Set `AOS_DEV_MODE` back to `false` (or remove it) before deploying, and run
one final `npm run build` to refresh `assets/build/`.

## Editing the UI (production workflow)
```bash
cd app
npm install
npm run build    # rebuilds into ../assets/build (main.js/main.css)
```
Rebuilding automatically updates what the plugin serves in production mode —
no PHP changes needed, since the enqueue uses filemtime() for cache-busting.

For continuous rebuilding without dev mode's live HMR:
```bash
npx vite build --watch
```
