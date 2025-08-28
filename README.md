# ArcGIS OAuth2 (PKCE) — Hardened Demo (v8)

This update adds:
- **State verification** on the callback (CSRF protection).
- **Token expiry handling** that sends the user through login when the token is near expiry.
- **Expanded CSP `connect-src`** for ArcGIS service domains.
- `referrer` policy set to **no-referrer**.

## Setup
Add this redirect URL to your ArcGIS app:
`https://justinm1988.github.io/SessionTest/callback.html`
