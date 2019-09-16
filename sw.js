const staticCacheName = 'site-static-v1';
const dynamicCacheName = 'site-dynamic-v1';
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/css/style.css',
    'https://fonts.googleapis.com/css?family=Roboto&display=swap',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
    'https://code.jquery.com/jquery-3.3.1.slim.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
    '/img/logo_192.png',
    '/offline.html'
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        })
    })
};

self.addEventListener('install', evt => {
    //console.log('Service worker has been installed');
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Caching shell assets');
            cache.addAll(assets);
        })
    );
})
self.addEventListener('activate', evt => {
    console.log('Service worker has been activated');
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            )
        })
    );
})
self.addEventListener('fetch', evt => {
    //console.log('Fetch event', evt);
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request).then(fetchRes => {
                return caches.open(dynamicCacheName).then(cache => {
                    cache.put(evt.request.url, fetchRes.clone());
                    limitCacheSize(dynamicCacheName, 20);
                    return fetchRes;
                })
            });
        }).catch(() => caches.match('/offline.html'))
    );
})