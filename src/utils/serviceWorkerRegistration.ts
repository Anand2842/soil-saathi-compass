// Service Worker Registration for production
import { logger } from './monitoring';

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        logger.info('Service Worker registered successfully', 'service_worker', {
          scope: registration.scope,
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                logger.info('New service worker available', 'service_worker');
                
                // Notify user about update
                if (confirm('A new version of Soil Saathi is available. Would you like to update now?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          logger.info('Service Worker controller changed', 'service_worker');
        });

      } catch (error) {
        logger.error('Service Worker registration failed', error as Error, 'service_worker');
      }
    });
  } else {
    logger.info('Service Worker not supported or in development mode', 'service_worker');
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      logger.info('Service Worker unregistered', 'service_worker');
    } catch (error) {
      logger.error('Service Worker unregistration failed', error as Error, 'service_worker');
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    logger.warn('Notifications not supported', 'notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info(`Notification permission: ${permission}`, 'notifications');
    return permission === 'granted';
  } catch (error) {
    logger.error('Failed to request notification permission', error as Error, 'notifications');
    return false;
  }
};

// Enable background sync
export const enableBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      logger.info(`Background sync registered: ${tag}`, 'background_sync');
    } catch (error) {
      logger.error('Background sync registration failed', error as Error, 'background_sync');
    }
  }
};

// Get cache storage information
export const getCacheInfo = async (): Promise<{ name: string; size: number }[]> => {
  if (!('caches' in window)) return [];

  try {
    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          size: keys.length,
        };
      })
    );
    return cacheInfo;
  } catch (error) {
    logger.error('Failed to get cache info', error as Error, 'cache');
    return [];
  }
};

// Clear all caches
export const clearAllCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      logger.info('All caches cleared', 'cache');
    } catch (error) {
      logger.error('Failed to clear caches', error as Error, 'cache');
    }
  }
};