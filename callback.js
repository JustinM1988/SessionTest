// callback.js — ensures library is loaded with CDN fallback

const logEl = document.getElementById("log");
const log = (msg) => { if (logEl) logEl.textContent += (msg + "\n"); };

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

async function ensureAuthLib() {
  if (window.arcgisRestAuth) return;
  try {
    await loadScript("https://unpkg.com/@esri/arcgis-rest-auth@3.8.0/dist/umd/auth.umd.min.js");
  } catch {}
  if (!window.arcgisRestAuth) {
    await loadScript("https://cdn.jsdelivr.net/npm/@esri/arcgis-rest-auth@3.8.0/dist/umd/auth.umd.min.js");
  }
  if (!window.arcgisRestAuth) throw new Error("Auth library failed to load.");
}

(async () => {
  try {
    await ensureAuthLib();
    const { UserSession } = window.arcgisRestAuth;
    const CONFIG = window.CONFIG || {};

    function buildRedirectUri(filename = "callback.html") {
      const base = location.origin + location.pathname.replace(/[^/]*$/, "");
      return base + filename;
    }

    const RUNTIME = {
      redirectUri: buildRedirectUri("callback.html"),
      portal: (CONFIG.PORTAL || "https://www.arcgis.com/sharing/rest").replace(/\/$/, ""),
      clientId: CONFIG.CLIENT_ID || "YOUR_CLIENT_ID_HERE"
    };

    const STORAGE_KEY = "arcgis_session_v1";
    const done = await UserSession.completeOAuth2({
      clientId: RUNTIME.clientId,
      redirectUri: RUNTIME.redirectUri,
      portal: RUNTIME.portal
    });

    sessionStorage.setItem(STORAGE_KEY, done.serialize());
    const back = sessionStorage.getItem("postLoginRedirect")
      || (location.origin + location.pathname.replace("callback.html",""));
    log("Success. Redirecting…");
    location.replace(back);
  } catch (e) {
    log("OAuth error:");
    log(e?.message || String(e));
    log("\\nCheck:");
    log("• CLIENT_ID in config.js matches your ArcGIS OAuth app");
    log("• Redirect URI in ArcGIS app includes this exact callback URL");
    log("• PORTAL points to your Online/Enterprise /sharing/rest endpoint");
  }
})();
