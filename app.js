// app.js — waits for libs; has CDN fallback; enables UI when ready

const els = {
  login: document.getElementById("login-btn"),
  whoami: document.getElementById("whoami-btn"),
  logout: document.getElementById("logout-btn"),
  statusText: document.getElementById("status-text"),
  output: document.getElementById("output")
};

function setStatus(text) { els.statusText.textContent = text; }
function print(obj) { els.output.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2); }

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

async function ensureArcgisRest() {
  if (window.arcgisRestAuth && window.arcgisRestRequest) return;
  // Try unpkg first
  try {
    await loadScript("https://unpkg.com/@esri/arcgis-rest-auth@3.8.0/dist/umd/auth.umd.min.js");
  } catch {}
  try {
    await loadScript("https://unpkg.com/@esri/arcgis-rest-request@3.8.0/dist/umd/request.umd.min.js");
  } catch {}
  // Fallback to jsDelivr if still missing
  if (!window.arcgisRestAuth) {
    await loadScript("https://cdn.jsdelivr.net/npm/@esri/arcgis-rest-auth@3.8.0/dist/umd/auth.umd.min.js");
  }
  if (!window.arcgisRestRequest) {
    await loadScript("https://cdn.jsdelivr.net/npm/@esri/arcgis-rest-request@3.8.0/dist/umd/request.umd.min.js");
  }
  if (!window.arcgisRestAuth || !window.arcgisRestRequest) {
    throw new Error("ArcGIS REST JS libraries failed to load from both CDNs.");
  }
}

function enableUI() {
  for (const el of [els.login, els.whoami, els.logout]) el.removeAttribute("disabled");
}

(async () => {
  try {
    await ensureArcgisRest();
    const { UserSession } = window.arcgisRestAuth;
    const { request } = window.arcgisRestRequest;
    const CONFIG = window.CONFIG || {};
    const STORAGE_KEY = "arcgis_session_v1";

    function buildRedirectUri(filename = "callback.html") {
      const base = location.origin + location.pathname.replace(/[^/]*$/, "");
      return base + filename;
    }

    const RUNTIME = {
      redirectUri: buildRedirectUri("callback.html"),
      portal: (CONFIG.PORTAL || "https://www.arcgis.com/sharing/rest").replace(/\/$/, ""),
      clientId: CONFIG.CLIENT_ID || "YOUR_CLIENT_ID_HERE"
    };

    function loadSession() {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try { return UserSession.deserialize(raw); }
      catch { sessionStorage.removeItem(STORAGE_KEY); return null; }
    }

    async function whoAmI(session) {
      const url = `${RUNTIME.portal}/community/self`;
      return request(url, { authentication: session });
    }

    // Initial status + enable buttons
    enableUI();
    const existing = loadSession();
    setStatus(existing ? "signed in" : "signed out");
    if (existing) print("You are signed in. Click “Who am I?” to fetch your profile.");

    els.login.addEventListener("click", () => {
      sessionStorage.setItem("postLoginRedirect", window.location.href);
      UserSession.authorize({
        clientId: RUNTIME.clientId,
        redirectUri: RUNTIME.redirectUri,
        portal: RUNTIME.portal,
        expiration: 120,
        popup: false
      });
    });

    els.logout.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus("signed out");
      print("Signed out. Refresh or sign in again.");
    });

    els.whoami.addEventListener("click", async () => {
      const session = loadSession();
      if (!session) { setStatus("signed out"); print("No session found. Click “Sign in with ArcGIS” first."); return; }
      setStatus("fetching…");
      try {
        const me = await whoAmI(session);
        setStatus("signed in");
        print(me);
      } catch (e) {
        setStatus("error");
        print(`Error: ${e?.message || e}`);
      }
    });
  } catch (e) {
    setStatus("error");
    print("Startup error: " + (e?.message || e));
  }
})();
