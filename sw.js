const CACHE='jishi-pwa-v22';
const BASE=new URL('./',self.location.href);
const FILES=['./','index.html','icon.svg','manifest.webmanifest','icons/icon-192-rounded.png','icons/icon-512-rounded.png','icons/apple-touch-icon-rounded.png'].map(path=>new URL(path,BASE).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('jishi-pwa-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{if(!response.ok)throw Error('Navigation unavailable');const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(new URL('index.html',BASE).href,copy)));return response}).catch(()=>caches.match(new URL('index.html',BASE).href)));return;
 }
 if(!FILES.includes(url.href))return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)))}return response})));
});

self.addEventListener('message',event=>{
 if(event.data?.type!=='JISHI_FOCUS_SELF'||!event.source?.id)return;
 event.waitUntil((async()=>{
  let focused=false;
  try{const client=await self.clients.get(event.source.id);if(client&&new URL(client.url).pathname.startsWith(BASE.pathname)){const result=await client.focus();focused=result.focused}}catch{}
  event.ports[0]?.postMessage({focused});
 })());
});
