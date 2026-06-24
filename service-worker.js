const CACHE_NAME = "banamong-game-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./banamong-icon.png",
    "./background.png",
    "./banana.png",
    "./monkey.png",
    "./dog.png",
    "./gorilla.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if(event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((response) => {
                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseCopy);
                });

                return response;
            });
        })
    );
});
