import  * as d from '../../declarations';
import { appError } from './app-error';


export async function appUpdate(ctx: d.DevServerClientContext, win: d.DevClientWindow, doc: Document, buildResults: d.DevServerBuildResults) {
  try {
    console.log('updateApp');

    if (buildResults.hasError) {
      // looks like we've got an error
      // let's show the error all pretty like
      appError(doc, buildResults);
      return;
    }

    if (ctx.isInitialDevServerLoad) {
      // this page is the initial dev server loading page
      // and build has finished without errors
      // let's make sure the url is at the root
      // and let's refresh the page
      await appReset(win);
      win.location.reload(true);
      return;
    }

  } catch (e) {
    console.error(e);
  }
}


export async function appReset(win: d.DevClientWindow) {
  // we're probably at some ugly url
  // let's update the url to be the expect root url: /
  win.history.replaceState({}, 'App', '/');

  // it's possible a service worker is already registered
  // for this localhost url from some other app's development
  // let's ensure we entirely remove the service worker for this domain
  const swRegistration = await win.navigator.serviceWorker.getRegistration();
  if (swRegistration) {
    const hasUnregistered = await swRegistration.unregister();
    if (hasUnregistered) {
      console.log(`unregistered service worker`);
    }
  }
}
