import * as d from './declarations';
import { initDevServer } from './init-dev-server';
import { initDocument } from './init-document';


function init(devServer: d.DevClient) {
  if (devServer.hasScriptInitialized) {
    return;
  }

  devServer.hasScriptInitialized = true;

  if (devServer.initDevServer) {
    initDevServer(document);

  } else {
    initDocument(document);
  }
}

init((window as any).$devServer = (window as any).$devServer || {});
