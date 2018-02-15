import { CompilerCtx, Config } from '../declarations';
import { createHttpRequestHandler } from './request-handler';
import { findClosestOpenPort } from './find-closest-port';
import { getAddressForBrowser } from './utils';
import { getOptions } from './options';
import { getSSL } from './ssl';

import * as http from 'http';
import * as https from 'https';


export async function startDevServer(config: Config, compilerCtx: CompilerCtx) {
  const opts = getOptions(config);

  opts.httpPort = await findClosestOpenPort(opts.address, opts.httpPort);

  const requestHandler = createHttpRequestHandler(opts, compilerCtx);

  const httpServer  = opts.ssl ? https.createServer(await getSSL(), requestHandler).listen(opts.httpPort)
                               : http.createServer(requestHandler).listen(opts.httpPort);

  const browserUrl = getAddressForBrowser(opts.address);
  const devUrl = `${opts.protocol}://${browserUrl}:${opts.httpPort}`;

  config.logger.info(`dev server: ${devUrl}`);

  async function close() {

    await new Promise((resolve, reject) => {
      httpServer.close((err: any) => {
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

}
