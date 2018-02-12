import { CompilerCtx, Config } from '../../../declarations';
import { createHttpRequestHandler } from './request-handler';
import { createLiveReload } from './live-reload';
import { findClosestOpenPort } from './find-closest-port';
import { getAddressForBrowser } from './utils';
import { getSSL } from './ssl';
import { getOptions } from './options';
import * as opn from 'opn';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { newSilentPublisher } from '@ionic/discover';


export async function start(config: Config, compilerCtx: CompilerCtx) {
  const opts = getOptions(config);

  const [ foundHttpPort, foundLiveReloadPort ] = await Promise.all([
    findClosestOpenPort(opts.address, opts.httpPort),
    findClosestOpenPort(opts.address, opts.liveReloadPort),
  ]);

  const [ tinyLrServer, lrScriptLocation, emitLiveReloadUpdate ] = await createLiveReload(foundLiveReloadPort, opts.address, opts.root, opts.ssl);

  const jsScriptLocations: string[] = opts.additionalJsScripts
    .map((filePath: string) => filePath.trim())
    .concat(lrScriptLocation);

  const requestHandler = createHttpRequestHandler(opts, compilerCtx);

  const httpServer  = opts.ssl ? https.createServer(await getSSL(), requestHandler).listen(foundHttpPort)
                               : http.createServer(requestHandler).listen(foundHttpPort);

  const browserUrl = getAddressForBrowser(opts.address);
  const devUrl = `${opts.protocol}://${browserUrl}:${foundHttpPort}`;

  config.logger.info(`dev server: ${devUrl}`);

  if (opts.broadcast) {
    config.logger.debug(`publishing broadcast`);
    newSilentPublisher('devapp', 'stencil-dev', foundHttpPort);
  }

  async function close() {
    tinyLrServer.close();

    await new Promise((resolve, reject) => {
      httpServer.close(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  process.once('SIGINT', async () => {
    await close();
    process.exit(0);
  });

  return {
    httpServer,
    tinyLrServer,
    close
  };
}
