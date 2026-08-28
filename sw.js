/* Organizador de Concursos — service worker opcional.
   Rede primeiro (o arquivo atualiza sozinho quando você sobe uma versão nova)
   e cache como reserva, para o app abrir sem internet. */
var CACHE='organizador';
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){
e.waitUntil(caches.keys().then(function(ks){
return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
if(e.request.method!=='GET')return;
if(new URL(e.request.url).origin!==location.origin)return;
e.respondWith(
fetch(e.request).then(function(r){
if(r&&r.status===200){var c=r.clone();caches.open(CACHE).then(function(ch){ch.put(e.request,c)})}
return r;
}).catch(function(){
return caches.match(e.request).then(function(m){return m||caches.match('./')||caches.match('index.html')});
})
);
});
