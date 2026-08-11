// Service Worker for Waack On Academy Web Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push events
self.addEventListener('push', (event) => {
  let data = {
    title: 'Waack On Academy 💃',
    body: '¡Tu feedback de baile ha sido revisado por el instructor!',
    icon: '/prowaacker_icon.png',
    feedbackId: ''
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/prowaacker_icon.png',
    badge: data.icon || '/prowaacker_icon.png',
    tag: `feedback-review-${data.feedbackId || Date.now()}`,
    data: {
      url: data.url || '/',
      feedbackId: data.feedbackId
    },
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const feedbackId = event.notification.data?.feedbackId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', feedbackId });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/?tab=entrenamiento&subtab=feedback');
      }
    })
  );
});
