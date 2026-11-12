# URL Shortener — complete project (backend + frontend)

Everything in one file: your backend (with the redirect route added back) and the Chrome Extension frontend.

## What's inside

- `backend/` — Express + MongoDB backend (Phases 1–5, plus the redirect route)
  - `server.js`, `src/app.js`, `src/routes/urls.routes.js`, `src/models/url.schema.js`, `src/db/db.js`
  - `backend/CHANGES.md` — what changed for the redirect fix
  - `backend/.env.example` — copy this to `.env` and fill in your real MongoDB link
- `extension/` — "Shorty" Chrome Extension popup (Phase 6 frontend)
  - `manifest.json`, `popup.html`, `popup.css`, `popup.js`, `icons/`
  - `extension/README.md` — extension-only notes

## How to run it

### 1. Start the backend

1. Open a terminal in the `backend/` folder
2. If you don't have a `.env` file yet, copy `.env.example` to `.env` and put your MongoDB link in `MONGO_URI`
3. Run:
   - `npm install`
   - `npm run dev`
4. You should see `Server running on port 3000` and `Connected to DB`

### 2. Load the extension

1. In Chrome, go to `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked** and choose the `extension/` folder
4. Click the Shorty icon in your toolbar, and pin it if you want it always visible

### 3. Use it

- Paste a long URL and click **Shorten**, or click **Use current tab**
- Click **Copy** to copy the short link, or **Open** to open it — Open works now, because the redirect route is back in the backend
- Your links list below shows clicks, newest first, with a Delete button on each link
- If it says "Server off", your backend isn't running — start it and press **Refresh** in the popup

## Notes

- The backend runs on port 3000 by default, and the extension talks to `http://localhost:3000`. If you change the port or deploy the backend later, change the address in the extension's Settings.
- Do not upload your real `.env` file anywhere — it has your MongoDB link in it. It is already in `.gitignore`.
