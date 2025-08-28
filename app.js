// app.js — UMD globals, no modules
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

const els = {
  login: document.getElementById("login-btn"),
  whoami: document.getElementById("whoami-btn"),
  logout: document.getElementById("logout-btn"),
  statusText: document.getElementById("status-text"),
  output: document.getElementById("output")
};

function loadSession() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return UserSession.deserialize(raw); }
  catch (e) { sessionStorage.removeItem(STORAGE_KEY); return null; }
}
function clearSession() { sessionStorage.removeItem(STORAGE_KEY); }
function setStatus(t) { els.statusText.textContent = t; }
function print(o) { els.output.textContent = typeof o === "string" ? o : JSON.stringify(o, null, 2); }

async function whoAmI(session) {
  const url = `${RUNTIME.portal}/community/self`;
  return request(url, { authentication: session });
}

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
  clearSession();
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
