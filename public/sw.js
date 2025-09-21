// Service Worker for Soil Saathi
// Implements caching strategy for production deployment

const CACHE_NAME = 'soil-saathi-v1';
const STATIC_CACHE = 'soil-saathi-static-v1';
const DYNAMIC_CACHE = 'soil-saathi-dynamic-v1';
const SATELLITE_CACHE = 'soil-saathi-satellite-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/manifest.json',
  '/offline.html',
  // Core CSS and JS will be added by build process
];

// Satellite imagery and API responses that should be cached
const CACHEABLE_APIS = [
  '/api/satellite',
  '/api/field-analysis',
  '/api/weather',
  'functions/gee-analysis',
  'functions/enhanced-field-summary'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(STATIC_ASSETS);
        console.log('Service Worker: Static assets cached');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Installation failed', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== SATELLITE_CACHE)
          .map(name => caches.delete(name));
        
        await Promise.all(deletePromises);
        console.log('Service Worker: Old caches cleaned');
        
        // Take control of all pages immediately
        await self.clients.claim();
      } catch (error) {
        console.error('Service Worker: Activation failed', error);
      }
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Satellite/API data - Network First with long-term cache
    if (isSatelliteAPI(url)) {
      return await networkFirstWithLongCache(request, SATELLITE_CACHE);
    }
    
    // Strategy 3: API calls - Network First with short cache
    if (isAPI(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: HTML pages - Network First with fallback
    if (isHTMLPage(url)) {
      return await networkFirstWithOfflineFallback(request, DYNAMIC_CACHE);
    }
    
    // Default: Network only
    return await fetch(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network Error', { status: 503 });
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      // Cache for 5 minutes for API responses
      const clonedResponse = response.clone();
      setTimeout(() => {
        cache.put(request, clonedResponse);
      }, 0);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Network First with Long Cache (for satellite imagery)
async function networkFirstWithLongCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Network First with Offline Fallback
async function networkFirstWithOfflineFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return await caches.match('/offline.html') || 
             new Response('You are offline', { status: 503 });
    }
    throw error;
  }
}

// Helper functions
function isStaticAsset(url) {
  return /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/i.test(url.pathname) ||
         url.pathname.includes('/assets/');
}

function isSatelliteAPI(url) {
  return CACHEABLE_APIS.some(api => url.pathname.includes(api)) &&
         (url.searchParams.has('satellite') || url.pathname.includes('satellite'));
}

function isAPI(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.includes('/functions/') ||
         url.hostname.includes('supabase.co');
}

function isHTMLPage(url) {
  return url.pathname.endsWith('/') || 
         url.pathname.endsWith('.html') ||
         (!url.pathname.includes('.') && request.headers.get('accept')?.includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync() {
  console.log('Service Worker: Processing background sync');
  // Process any queued offline actions
  // This could include field data, analysis requests, etc.
}

// Push notifications for field alerts
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data)
    );
  }
});

console.log('Service Worker: Loaded and ready');