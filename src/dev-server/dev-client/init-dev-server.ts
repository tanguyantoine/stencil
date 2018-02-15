import { initDocument } from './init-document';


export async function initDevServer(document: HTMLDocument) {
  await unregisterServiceWorker();

  history.replaceState({}, 'App', '/');

  initDocument(document);
}


async function unregisterServiceWorker() {
  if (location.protocol === 'file:') {
    return;
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const hasUnregistered = await registration.unregister();

    if (hasUnregistered) {
      console.log('service worker unregistered');
    }
  }
}
