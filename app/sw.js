self.addEventListener('push', function (event) {

  const title = 'Sterna';
  const notificationOptions = {
    body: event.data ? event.data : 'Temos novidades para você!',
    icon: './img/logo-large.png',
    dir: 'auto',
    delay: 77777,
    focusWindowOnClick: true,
    vibrate: [100, 500, 100, 500, 100]
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );

});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );

});