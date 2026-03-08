// Service Worker for Campus Alert Push Notifications
const CACHE_NAME = 'campus-alert-v1';

self.addEventListener('install', (e) => {
  console.log('🔧 Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('✅ Service Worker activated');
  e.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (e) => {
  let data = {};
  try {
    data = e.data.json();
  } catch {
    data = { title: '🚨 Campus Alert', body: e.data?.text() || 'Emergency alert received' };
  }

  const options = {
    body: data.body || 'Emergency alert on campus',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'campus-alert',
    renotify: true,
    requireInteraction: true,  // stays until user dismisses
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '🚨 View Alert' },
      { action: 'dismiss', title: '✕ Dismiss' },
    ],
  };

  e.waitUntil(
    self.registration.showNotification(data.title || '🚨 CAMPUS EMERGENCY ALERT', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  if (e.action === 'dismiss') return;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data?.url || '/');
      }
    })
  );
});