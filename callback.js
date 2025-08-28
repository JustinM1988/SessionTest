// callback.js — local vendor, Justin-specific config

if (!window.arcgisRestAuth) {
  alert("Missing vendor/auth.umd.min.js — add it to /vendor then reload.");
}
const UserSession = window.arcgisRestAuth && window.arcgisRestAuth.UserSession;
const STORAGE_KEY = "arcgis_session_v1";
const logEl = document.getElementById("log");
const log = (msg) => { if (logEl) logEl.textContent += (msg + "\n"); };

function buildRedirectUri(filename = "callback.html") {
  const base = location.origin + location.pathname.replace(/[^/]*$/, "");
  return base + filename;
}

const RUNTIME = {
  redirectUri: buildRedirectUri("callback.html"),
  portal: "https://www.arcgis.com/sharing/rest",
  clientId: "ic6BRtzVkEpNKVjS"
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
    log("\nCheck that your ArcGIS app allows this redirect URL:");
    log("https://justinm1988.github.io/SessionTest/callback.html");
  }
})();
