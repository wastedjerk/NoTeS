const version = 1;
const staticCacheName = `staticCache-${version}`;
const dynamicCacheName = `dynamicCache-${version}`;

const assets = ["/", "/index.html", "/css/main.css", "/js/app.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
  console.log("sw, is now active");
});

//momentan so in der Arbeit
/*
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(event.request).then((fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(event.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch(() => caches.match("/offline.html"))
  );
});
*/

self.dynamicCachingEnabled = true;

self.addEventListener("message", (event) => {
  if (event.data.action === "enableDynamicCaching") {
    self.dynamicCachingEnabled = true;
  } else if (event.data.action === "disableDynamicCaching") {
    self.dynamicCachingEnabled = false;
  }
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return caches.open(dynamicCacheName).then((cache) => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    })
  );
});
