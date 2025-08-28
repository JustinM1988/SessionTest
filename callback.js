// callback.js — completes OAuth PKCE by exchanging code for token via fetch

const CONFIG = window.CONFIG;
const STORAGE_KEY = "arcgis_pkce_session_v1";
const PKCE_KEY = "arcgis_pkce_data_v1";

const logEl = document.getElementById("log");
const log = (m) => { logEl.textContent += (m + "\n"); };

function buildRedirectUri(filename = "callback.html") {
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  return base + filename;
}

const RUNTIME = {
  portalRest: (CONFIG.PORTAL || "https://www.arcgis.com/sharing/rest").replace(/\/$/, ""),
  oauthBase() { return this.portalRest + "/oauth2"; },
  redirectUri: buildRedirectUri("callback.html"),
  clientId: CONFIG.CLIENT_ID
};

function parseQuery() {
  const u = new URL(window.location.href);
  return Object.fromEntries(u.searchParams.entries());
}

async function exchangeCodeForToken(code, verifier) {
  const url = RUNTIME.oauthBase() + "/token";
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("client_id", RUNTIME.clientId);
  params.set("code", code);
  params.set("code_verifier", verifier);
  params.set("redirect_uri", RUNTIME.redirectUri);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Token exchange failed: " + res.status + " " + t);
  }
  return res.json();
}

(async () => {
  try {
    const q = parseQuery();
    const store = JSON.parse(sessionStorage.getItem(PKCE_KEY) || "{}");
    if (!q.code) throw new Error("Missing authorization code.");
    if (!store.verifier) throw new Error("Missing PKCE verifier in session.");

    const token = await exchangeCodeForToken(q.code, store.verifier);
    const now = Math.floor(Date.now()/1000);
    const sess = {
      access_token: token.access_token,
      expires_at: now + (token.expires_in || 0),
      username: token.username || null
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sess));

    const back = store.post || (location.origin + location.pathname.replace("callback.html",""));
    log("Success. Redirecting…");
    location.replace(back);
  } catch (e) {
    log("OAuth error: " + (e?.message || e));
    log("\nCheck that your ArcGIS app allows this redirect URL:");
    log(buildRedirectUri("callback.html"));
  }
})();
