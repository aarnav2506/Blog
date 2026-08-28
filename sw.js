self.addEventListener("install", (event) => {
  console.log("Service Worker installed for Aarnav Portfolio");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const isVideo = requestUrl.pathname.endsWith(".mp4") || event.request.headers.has("range");

  // MP4 playback needs network byte-range responses. Returning a cached whole
  // file for a range request makes some browsers pause repeatedly while looping.
  if (isVideo) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
