import { CompilerCtx, Config } from '../declarations';
import { createHttpRequestHandler } from './request-handler';
import { findClosestOpenPort } from './find-closest-port';
import { getSSL } from './ssl';
import { UNREGISTER_SW_URL } from './serve-file';
import * as http from 'http';
import * as https from 'https';


export async function startDevServer(config: Config, compilerCtx: CompilerCtx) {
  config.devServer.httpPort = await findClosestOpenPort(
    config.devServer.address,
    config.devServer.httpPort
  );

  const requestHandler = createHttpRequestHandler(config, compilerCtx);

  const httpServer = config.devServer.ssl ? https.createServer(await getSSL(), requestHandler).listen(config.devServer.httpPort)
                                          : http.createServer(requestHandler).listen(config.devServer.httpPort);

  const browserUrl = (config.devServer.address === '0.0.0.0') ? 'localhost' : config.devServer.address;
  const devUrl = `${config.devServer.protocol}://${browserUrl}:${config.devServer.httpPort}`;

  config.logger.info(`dev server listening on: ${devUrl}`);

  if (config.devServer.openBrowser) {
    let openUrl = devUrl;

    if (config.devServer.unregisterServiceWorker) {
      openUrl += UNREGISTER_SW_URL;

    } else {
      openUrl += '/';
    }

    config.sys.open(openUrl);
  }

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
