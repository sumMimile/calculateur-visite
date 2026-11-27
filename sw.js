// Service worker de « Japon 2027 » : application hors ligne.
const VERSION = "jp2027-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png",
  "lib/maplibre-gl-csp-worker.js", "map/manifest.json", "map/style.json", "map/trip.json", "map/countries.json", "map/res.txt", "assets.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  const page = r.mode === "navigate" || u.pathname.endsWith("/index.html") || u.pathname.endsWith("/");
  if (u.origin === location.origin && page) {
    // page : réseau d'abord (mises à jour), cache si hors ligne
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put("index.html", cp)); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  if (u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    // cartes, photos, polices : cache d'abord
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })));
  }
});
self.addEventListener("message", e => {
  if (!e.data || e.data.type !== "offline-all") return;
  const port = e.ports[0];
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    const man = await (await fetch("map/manifest.json")).json();
    const assets = await (await fetch("assets.json")).json();
    const list = [...SHELL, ...man.packs.map(p => "map/" + p), ...assets];
    let done = 0, failed = 0;
    for (const url of list) {
      try { if (!(await c.match(url))) { const res = await fetch(url); if (!res.ok) throw 0; await c.put(url, res); } } catch (x) { failed++; }
      done++; port.postMessage({ done, total: list.length, failed });
    }
  })());
});
