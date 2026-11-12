# Shorty — URL Shortener (Chrome Extension)

A small popup frontend for your own URL Shortener backend (the project in `url-shortner.zip`).

## What it does

- Paste a long URL and shorten it
- **Use current tab** — shortens the page you are on, in one click
- Shows the short link, with **Copy** and **Open** buttons
- Lists all your links, with clicks, newest first
- Delete a link from the list
- Shows a clear error if the backend is not running

## How your backend fits in

Your backend (from the zip you sent) runs on port **3000** and uses these routes:

- `POST http://localhost:3000/api/urls/shorten` — body: `{ "originalURL": "..." }`
- `GET http://localhost:3000/api/urls/` — lists all links
- `DELETE http://localhost:3000/api/urls/:shortCode`

Note the capital letters: the backend expects `originalURL`, not `originalUrl`. This extension sends it exactly that way.

## Install it in Chrome

1. Start your backend first, in your project folder:
   - `npm run dev`
   - You should see `Server running on port 3000` and `Connected to DB`
2. Open Chrome and go to `chrome://extensions`
3. Turn on **Developer mode** (top right)
4. Click **Load unpacked**
5. Choose the `url-shortener-extension` folder (the unzipped folder, not the zip file)
6. Click the Shorty icon in your toolbar. If you don't see it, click the puzzle-piece icon and pin Shorty.

## Use it

1. Click the Shorty icon
2. Paste a long URL, or click **Use current tab**
3. Click **Shorten**
4. Click **Copy** to copy the short link, or **Open** to open it
5. Your links list below refreshes automatically. Press **Delete** next to a link to remove it.

If you see **Server off** or "Could not reach the server", your backend is not running — start it with `npm run dev` and press **Refresh** in the popup.

## Change the backend address

If you deploy your backend later, or run it on a different port:

1. In the popup, open **Settings**
2. Change the backend address, for example `https://your-server.com`
3. Click **Save address**

Important: the extension can only talk to addresses listed in `manifest.json` under `host_permissions`. If you change to a new address, add that address there too, then press **Reload** on the extension in `chrome://extensions`.

## One thing to check in your backend

The zip you sent does **not** have the redirect route in `src/app.js` — the Phase 4 route that turns `http://localhost:3000/1e35a1c` back into the original page. Your API routes (`/api/urls/...`) all work, but clicking a short link in the browser will give a 404 until that redirect route is added back in `src/app.js`, after the `/api/urls` routes. The extension's **Open** button uses that short link, so add the redirect back if you want Open to work.

## Files

- `manifest.json` — Chrome Extension Manifest V3, popup, icons, permissions
- `popup.html` — the popup layout
- `popup.css` — popup styling (360px wide, made for a popup, not a full page)
- `popup.js` — all the logic: shorten, list, delete, copy, current tab, settings
- `icons/` — extension icons (16, 48, 128)
