const CACHE = "cuscuz-de-casa-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((chave) => chave.startsWith("cuscuz-de-casa-") && chave !== CACHE).map((chave) => caches.delete(chave))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requisicao = event.request;
  if (requisicao.method !== "GET" || new URL(requisicao.url).origin !== self.location.origin) return;

  if (new URL(requisicao.url).pathname === "/api/feriados") {
    event.respondWith(fetch(requisicao));
    return;
  }

  if (requisicao.mode === "navigate") {
    event.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          if (resposta.ok) void caches.open(CACHE).then((cache) => cache.put(requisicao, resposta.clone()));
          return resposta;
        })
        .catch(async () => (await caches.match(requisicao)) ?? (await caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    caches.match(requisicao).then((emCache) => {
      if (emCache) return emCache;
      return fetch(requisicao).then((resposta) => {
        if (resposta.ok) void caches.open(CACHE).then((cache) => cache.put(requisicao, resposta.clone()));
        return resposta;
      });
    }),
  );
});
