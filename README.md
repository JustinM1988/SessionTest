# ArcGIS OAuth2 (PKCE) • GitHub Pages Demo

A zero-backend sample that signs in to ArcGIS (Online or Enterprise) using OAuth 2.0 PKCE and displays the current user's profile. Designed to run on GitHub Pages.

## Files
- `index.html` – UI with **Sign in / Who am I? / Sign out**, plus a strict Content Security Policy (CSP).
- `app.js` – starts OAuth (PKCE), stores a short-lived session in `sessionStorage`, calls `/community/self`.
- `callback.html` + `callback.js` – completes the OAuth redirect and saves the session (no inline JS; CSP-safe).
- `config.js` – put your `CLIENT_ID` and (optionally) `PORTAL`.

## Setup (ArcGIS Online)
1. Create an **OAuth 2.0 application** in ArcGIS Developers/ArcGIS Online and copy the **Client ID**.
2. In `config.js`, set `CLIENT_ID` to your App ID. Keep `PORTAL` for ArcGIS Online; for Enterprise set your `https://…/sharing/rest` URL.
3. Add this **Redirect URI** to the app (adjust for your username/repo):
   - `https://<your-username>.github.io/<your-repo>/callback.html`
4. Commit and push to GitHub. In **Settings → Pages**, enable Pages from the `main` branch (root).
5. Open your Pages URL, click **Sign in**, authorize, then click **Who am I?** to see your profile JSON.

## Security notes
- Uses **Authorization Code with PKCE** (recommended for browser apps). Tokens are short‑lived and stored only in `sessionStorage`.
- **No client secret** is used (never embed a secret in front-end code).
- **CSP** blocks inline scripts and restricts network calls to ArcGIS domains. If using ArcGIS Enterprise, edit `CONNECT` and `FORM‑ACTION` allow‑lists to include your portal (e.g., `https://your-portal.example.com/portal`).  
- Only the **exact Pages URL** appears in the OAuth app's redirect allow‑list.
- For long‑running workflows or refresh token storage, add a very small backend and follow the server tutorial; this pure front‑end sample is for quick sign‑in checks.

## Troubleshooting
- **Invalid redirect URI**: Make sure the callback URL exactly matches what’s registered on the app.
- **CORS errors**: Confirm `PORTAL` points at `/sharing/rest` and your CSP `connect-src` includes that origin.
- **Enterprise path quirks**: Some portals use a context path like `/portal/sharing/rest` – include that whole path.
- **Signed out after refresh**: Session uses `sessionStorage` which resets when the tab closes; that's by design.

