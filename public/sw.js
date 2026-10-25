self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// Web Push (server-sent) support
self.addEventListener("push", (e) => {
  let d = { title: "CODE DEVS DIGITAL", body: "", url: "/" };
  try { d = e.data.json(); } catch { d.body = e.data ? e.data.text() : ""; }
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: "/icon-192.png", badge: "/icon-192.png", data: { url: d.url || "/" } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    if (cs[0]) { cs[0].focus(); return cs[0].navigate ? cs[0].navigate(url) : null; }
    return self.clients.openWindow(url);
  }));
});
