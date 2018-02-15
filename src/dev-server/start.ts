import { CompilerCtx, Config } from '../declarations';
import { createHttpRequestHandler } from './request-handler';
import { findClosestOpenPort } from './find-closest-port';
import { getAddressForBrowser } from './utils';
import { getSSL } from './ssl';
import { validateDevServerConfig } from './validate-dev-server-config';

import * as http from 'http';
import * as https from 'https';


export async function startDevServer(config: Config, compilerCtx: CompilerCtx) {
  validateDevServerConfig(config);

  config.devServer.httpPort = await findClosestOpenPort(
    config.devServer.address,
    config.devServer.httpPort
  );

  const requestHandler = createHttpRequestHandler(config, compilerCtx);

  const httpServer = config.devServer.ssl ? https.createServer(await getSSL(), requestHandler).listen(config.devServer.httpPort)
                                          : http.createServer(requestHandler).listen(config.devServer.httpPort);

  const browserUrl = getAddressForBrowser(config.devServer.address);
  const devUrl = `${config.devServer.protocol}://${browserUrl}:${config.devServer.httpPort}`;

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
