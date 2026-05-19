const CACHE_NAME = 'statna-skuska-pwa';

const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './favicon/favicon.ico',
  './favicon/favicon-16x16.png',
  './favicon/favicon-32x32.png',
  './favicon/apple-touch-icon.png',
  './favicon/android-chrome-192x192.png',
  './favicon/android-chrome-512x512.png',
  './answers/01-operacne-systemy.md',
  './answers/02-pocitacove-architektury.md',
  './answers/03-databazove-systemy.md',
  './answers/04-internetove-technologie.md',
  './answers/05-grafika-a-multimedia.md',
  './answers/06-algoritmy-a-programovanie.md',
  './answers/07-softverove-inzinierstvo.md',
  './answers/08-teoreticke-zaklady-informatiky.md',
  './answers/09-siete-a-bezpecnost.md',
  './answers/styles/adt-style.css',
  './answers/styles/bezier-style.css',
  './answers/styles/color-style.css',
  './answers/styles/dfa-style.css',
  './answers/styles/palette-style.css',
  './answers/styles/pda-style.css',
  './answers/styles/raster-style.css',
  './answers/styles/sort-style.css',
  './answers/styles/study-style.css',
  './answers/styles/transform-style.css',
  './answers/styles/turing-style.css',
  './answers/scripts/adt-animations.js',
  './answers/scripts/bezier-animations.js',
  './answers/scripts/color-animations.js',
  './answers/scripts/dfa-animations.js',
  './answers/scripts/palette.js',
  './answers/scripts/pda-animations.js',
  './answers/scripts/raster-animations.js',
  './answers/scripts/sort-animations.js',
  './answers/scripts/study.js',
  './answers/scripts/transform-animations.js',
  './answers/scripts/turing-animations.js',
  './images/01-operacne-systemy/deadlock.png',
  './images/01-operacne-systemy/hdd.jpg',
  './images/01-operacne-systemy/segmentacia-a-strankovanie-na-ziadost.png',
  './images/01-operacne-systemy/spojite-vs-nespojite-pridelovanie-pamate.png',
  './images/01-operacne-systemy/tanenbaum-extended-machine.png',
  './images/02-pocitacove-architektury/1959c_1401_System_Users2_16x9.avif',
  './images/02-pocitacove-architektury/Glen_Beck_and_Betty_Snyder_program_the_ENIAC_in_building_328_at_the_Ballistic_Research_Laboratory.jpg',
  './images/02-pocitacove-architektury/IBM_System_360_model_30_profile.agr.jpg',
  './images/02-pocitacove-architektury/Intel_C4004.jpg',
  './images/02-pocitacove-architektury/Von_Neumann_Architecture.svg',
  './images/02-pocitacove-architektury/central_processing_unit234.webp',
  './images/02-pocitacove-architektury/diferencialny-analyzator.jpg',
  './images/05-grafika-a-multimedia/cie-1931-cie-rgb.svg',
  './images/05-grafika-a-multimedia/dda-vs-bresenham.svg',
  './images/05-grafika-a-multimedia/mocap-systemy.png',
  './images/05-grafika-a-multimedia/rasterizacia-usecky.gif',
  './images/05-grafika-a-multimedia/rigging-example.jpg',
  './images/05-grafika-a-multimedia/rotacia-okolo-vlastneho-stredu.gif',
  './images/07-softverove-inzinierstvo/diagram-aktivit-1.jpg',
  './images/07-softverove-inzinierstvo/diagram-aktivit-2.jpg',
  './images/07-softverove-inzinierstvo/diagram-aktivit-2.png',
  './images/07-softverove-inzinierstvo/diagram-tried.png',
  './images/07-softverove-inzinierstvo/kanban-workflow.png',
  './images/07-softverove-inzinierstvo/prvky-diagramu-aktivit.svg',
  './images/07-softverove-inzinierstvo/scrum-workflow.png',
  './images/07-softverove-inzinierstvo/sekvencny-diagram.jpg',
  './images/07-softverove-inzinierstvo/sekvencny-diagram.png',
  './images/07-softverove-inzinierstvo/stavovy-diagram.jpg',
  './images/07-softverove-inzinierstvo/stavovy-diagram.png',
  './images/07-softverove-inzinierstvo/uml-diagramy.jpg',
  './images/07-softverove-inzinierstvo/use-case-akteri.svg',
  './images/07-softverove-inzinierstvo/use-case-druhy-akterov.svg',
  './images/07-softverove-inzinierstvo/use-case-vztahy.svg',
  './images/07-softverove-inzinierstvo/v-model.jpg',
  './images/07-softverove-inzinierstvo/vztahy-medzi-triedami.svg',
  './images/07-softverove-inzinierstvo/waterfall-model.svg',
  './images/09-siete-a-bezpecnost/Caesar3.svg',
  './images/09-siete-a-bezpecnost/icmp-ping-julis.png',
  './images/mocap.png',
  './images/optical-motion-capture-2.jpg',
  './images/rigging-example.jpg',
  './images/slide-50.jpg',
  'https://cdn.jsdelivr.net/npm/marked@12.0.0/marked.min.js',
  'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.esm.min.mjs'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || response.status !== 200) return response;

        const url = new URL(request.url);
        if (url.origin === self.location.origin || url.hostname === 'cdn.jsdelivr.net') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }

        return response;
      });
    })
  );
});
