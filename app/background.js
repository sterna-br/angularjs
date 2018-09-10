chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('index.html', {
       id: 'main',
      outerBounds: {
          'width': 1280,
          'height': 800
      }
  });
});
