import { initDocument } from './init-document';


export function initDevServer(document: HTMLDocument) {
  unregisterServiceWorker();

  history.replaceState({}, 'App', '/');

  initDocument(document);
}


async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const hasUnregistered = await registration.unregister();

    if (hasUnregistered) {
      console.log('service worker unregistered');
    }
  }
}
