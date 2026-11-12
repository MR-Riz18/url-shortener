# CHANGES.md — URL Shortener: redirect route restored

## What was broken
- `src/app.js` had **no redirect route**. A short link like
  `http://localhost:3000/1e35a1c` (or any `GET /<shortCode>`) returned **404**,
  even though the short code existed in the database.
- The API routes under `/api/urls` (shorten, list, get one, delete) all worked;
  only the public redirect was missing.

## What was fixed
- **Changed file: `src/app.js` only.**
  - Added `GET /:shortCode` **after** `app.use('/api/urls', urlRoutes)`, so the
    API routes are matched first.
  - The route looks up `shortCode` in the `Url` model:
    - Not found → `404` with `{ "message": "No shortened URL found" }`
    - Found → `clicks` is increased by 1, the document is saved, and the
      server responds with a **302 redirect** to `originalURL`.
- No other files were changed. Field names are unchanged (`originalURL`,
  `shortCode`, `clicks`, `createdAT`) and the existing API contract is untouched.

## How to run it
1. `npm install`
2. Create a `.env` file with your MongoDB connection string:
   `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>`
   (Optional: `PORT=3000`, `BASE_URL=http://localhost:3000`)
3. `npm run dev` (or `npm start`)
4. Server runs on port **3000**.

## What was tested (11 Nov 2026, against a local MongoDB)
| Test | Result |
|---|---|
| `POST /api/urls/shorten` with `{"originalURL": "https://example.com/some/long/page"}` | **201** — returned `shortCode: c09c548`, `shortUrl: http://localhost:3000/c09c548`, `clicks: 0` |
| `GET /c09c548` | **302 Found** — `Location: https://example.com/some/long/page` |
| Clicks after 1st redirect (`GET /api/urls/c09c548`) | **clicks: 1** (was 0) |
| Clicks after 2nd redirect | **clicks: 2** |
| `GET /doesnotexist123` (made-up code) | **404** — `{"message": "No shortened URL found"}` |
| `GET /api/urls` (existing list API, unchanged) | **200** — listed the test URL with `clicks: 2` |

All tests passed.

---

## Hosting readiness — 2026-11-12

- `server.js` — the server now listens on `process.env.PORT` (falling
  back to 3000). It was hardcoded to 3000, which Render does not allow —
  Render assigns the port itself.
