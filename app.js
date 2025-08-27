// app.js
// Minimal PKCE login using ArcGIS REST JS on GitHub Pages.
// Uses sessionStorage, PKCE, and a strict CSP (no inline scripts).

import { CONFIG } from "./config.js";
import {
  UserSession
} from "https://unpkg.com/@esri/arcgis-rest-auth@3.8.0/dist/esm/index.js?module";
import {
  request
} from "https://unpkg.com/@esri/arcgis-rest-request@3.8.0/dist/esm/index.js?module";

const STORAGE_KEY = "arcgis_session_v1";

/** Compute callback URL reliably for GitHub Pages repo paths */
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
  catch (e) {
    console.warn("Failed to deserialize session:", e);
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveSession(session) { sessionStorage.setItem(STORAGE_KEY, session.serialize()); }
function clearSession() { sessionStorage.removeItem(STORAGE_KEY); }
function setStatus(text) { els.statusText.textContent = text; }
function print(obj) { els.output.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2); }

async function whoAmI(session) {
  if (!session) throw new Error("No session");
  const url = `${RUNTIME.portal}/community/self`;
  return request(url, { authentication: session });
}

// --- wire up UI ---
const existing = loadSession();
setStatus(existing ? "signed in" : "signed out");
if (existing) print("You are signed in. Click “Who am I?” to fetch your profile.");

els.login.addEventListener("click", () => {
  // Save where to return after login (handles repo paths neatly)
  sessionStorage.setItem("postLoginRedirect", window.location.href);
  UserSession.authorize({
    clientId: RUNTIME.clientId,
    redirectUri: RUNTIME.redirectUri,
    portal: RUNTIME.portal,
    duration: 120, // minutes; keep short-lived
    popup: false
  });
});

els.logout.addEventListener("click", () => {
  clearSession();
  setStatus("signed out");
  print("Signed out. Refresh or sign in again.");
});

els.whoami.addEventListener("click", async () => {
  try {
    const session = loadSession();
    if (!session) {
      setStatus("signed out");
      print("No session found. Click “Sign in with ArcGIS” first.");
      return;
    }
    setStatus("fetching…");
    const me = await whoAmI(session);
    setStatus("signed in");
    print(me);
  } catch (e) {
    setStatus("error");
    print(`Error: ${e?.message || e}`);
  }
});

// Expose for debugging
window._arcgis = { loadSession, saveSession, clearSession, RUNTIME };
