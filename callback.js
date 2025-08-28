// callback.js — UMD global usage
const { UserSession } = window.arcgisRestAuth;
const CONFIG = window.CONFIG || {};

const STORAGE_KEY = "arcgis_session_v1";
const logEl = document.getElementById("log");
const log = (msg) => { if (logEl) logEl.textContent += (msg + "\n"); };

function buildRedirectUri(filename = "callback.html") {
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  return base + filename;
}

const RUNTIME = {
  redirectUri: buildRedirectUri("callback.html"),
  portal: (CONFIG.PORTAL || "https://www.arcgis.com/sharing/rest").replace(/\/$/, ""),
  clientId: CONFIG.CLIENT_ID || "YOUR_CLIENT_ID_HERE"
};

(async () => {
  try {
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
    log("\nCheck:");
    log("• CLIENT_ID in config.js matches your ArcGIS OAuth app");
    log("• Redirect URI in ArcGIS app includes this exact callback URL");
    log("• PORTAL points to your Online/Enterprise /sharing/rest endpoint");
  }
})();
