# ArcGIS OAuth2 (PKCE) — No-Library Demo

Pure browser JS implementation of the Authorization Code + PKCE flow for ArcGIS.
No external libraries or CDNs. Uses `fetch` and WebCrypto to generate PKCE values.

## Files
- `index.html` – UI + buttons
- `app.js` – starts PKCE login and fetches `/community/self` with the token
- `callback.html` + `callback.js` – completes OAuth by exchanging the code for a token
- `config.js` – your Client ID and Portal

## Setup
1. In your ArcGIS app, add the redirect URL:
   `https://justinm1988.github.io/SessionTest/callback.html`
2. Deploy to GitHub Pages and open your site. Click **Sign in**, then **Who am I?**.
