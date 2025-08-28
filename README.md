# ArcGIS OAuth2 (PKCE) • GitHub Pages Demo (V4)

- Waits for ArcGIS REST JS to load, with **CDN fallback** (unpkg → jsDelivr)
- Updates CSP to allow both CDNs
- Disables buttons until libraries are ready
- Uses `expiration` (not `duration`) and sessionStorage

## Setup
1. Add Redirect URL to ArcGIS app:
   `https://<username>.github.io/<repo>/callback.html`
2. Set your `CLIENT_ID` in `config.js` (keep quotes).
3. Commit and open your Pages URL; click **Sign in**, then **Who am I?**.
