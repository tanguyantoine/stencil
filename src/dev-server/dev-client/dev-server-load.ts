import * as d from '../../declarations';


export function initDevServerLoad(win: d.DevClientWindow) {
  unregisterServiceWorker(win);

  win.history.replaceState({}, 'App', '/');
}


function unregisterServiceWorker(win: d.DevClientWindow) {
  if ('serviceWorker' in win.navigator) {
    win.navigator.serviceWorker.ready.then(registration => {
      registration.unregister().then(hasUnregistered => {
        if (hasUnregistered) {
          console.log('service worker unregistered');
        }
      });
    });
  }
}
