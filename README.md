# ArcGIS OAuth2 (PKCE) • GitHub Pages Demo (V3)
- UMD builds (forces browser path; no Node-only errors)
- Uses `expiration` (not `duration`)
- No inline JS; meta CSP allows `self` + unpkg
- `config.js` sets a global `window.CONFIG`

## Setup
1) ArcGIS App: add Redirect URL `https://<username>.github.io/<repo>/callback.html`
2) Edit `config.js` with your Client ID.
3) Commit/deploy to GitHub Pages. Visit `/index.html`, click **Sign in**, then **Who am I?**.
