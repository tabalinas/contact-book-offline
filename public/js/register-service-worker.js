if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
    }).then(function() {
        console.info('service worker registered');
    }).catch(function(e) {
        console.error(e, 'service worker registration failed');
    });
}
