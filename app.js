// app.js — zero-dependency PKCE for ArcGIS

const CONFIG = window.CONFIG;
const STORAGE_KEY = "arcgis_pkce_session_v1";
const PKCE_KEY = "arcgis_pkce_data_v1";

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

const els = {
  login: document.getElementById("login-btn"),
  whoami: document.getElementById("whoami-btn"),
  logout: document.getElementById("logout-btn"),
  statusText: document.getElementById("status-text"),
  output: document.getElementById("output")
};

function setStatus(t) { els.statusText.textContent = t; }
function print(o) { els.output.textContent = typeof o === "string" ? o : JSON.stringify(o, null, 2); }

function saveSession(obj) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
function loadSession() { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)); } catch { return null; } }
function clearSession() { sessionStorage.removeItem(STORAGE_KEY); }

function base64urlOfBytes(bytes) {
  let s = '';
  for (let i=0;i<bytes.length;i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

async function sha256Base64Url(input) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64urlOfBytes(new Uint8Array(digest));
}

function randomVerifier(len = 64) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return base64urlOfBytes(bytes);
}

async function startLogin() {
  const verifier = randomVerifier(96);
  const challenge = await sha256Base64Url(verifier);
  const state = randomVerifier(32);

  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ verifier, state, post: location.href }));

  const authUrl = new URL(RUNTIME.oauthBase() + "/authorize");
  authUrl.searchParams.set("client_id", RUNTIME.clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", RUNTIME.redirectUri);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  location.assign(authUrl.toString());
}

async function whoAmI() {
  const sess = loadSession();
  if (!sess || !sess.access_token) { print("No session. Sign in first."); setStatus("signed out"); return; }
  const url = new URL(RUNTIME.portalRest + "/community/self");
  url.searchParams.set("f","json");
  url.searchParams.set("token", sess.access_token);
  const res = await fetch(url, { credentials: "omit" });
  const json = await res.json();
  print(json);
}

els.login.addEventListener("click", startLogin);
els.logout.addEventListener("click", () => { clearSession(); setStatus("signed out"); print("Signed out."); });
els.whoami.addEventListener("click", whoAmI);

const existing = loadSession();
setStatus(existing && existing.access_token ? "signed in" : "signed out");
if (existing && existing.access_token) print("Token present. Click “Who am I?” to fetch your profile.");
