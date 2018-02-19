import { DevServerConfig, DevServerMessage, FileSystem } from '../declarations';
import { createRequestHandler } from './request-handler';
import { findClosestOpenPort } from './find-closest-port';
import { getSSL } from './ssl';
import { UNREGISTER_SW_URL } from './serve-file';
import * as http from 'http';
import * as https from 'https';


export async function startDevServer(config: DevServerConfig, fs: FileSystem) {
  config.httpPort = await findClosestOpenPort(config.address, config.httpPort);

  const reqHandler = createRequestHandler(config, fs);

  const server = config.ssl ? https.createServer(await getSSL(), reqHandler).listen(config.httpPort)
                            : http.createServer(reqHandler).listen(config.httpPort);

  createCloseListener(server as http.Server);

  notifyStartup(config);
}


function createCloseListener(server: http.Server) {
  async function close() {
    await new Promise((resolve, reject) => {
      server.close((err: any) => {
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


function notifyStartup(config: DevServerConfig) {
  config.browserUrl = (config.address === '0.0.0.0') ? 'localhost' : config.address;
  config.browserUrl = `${config.protocol}://${config.browserUrl}:${config.httpPort}`;

  const msg: DevServerMessage = {
    startServerResponse: {
      protocol: config.protocol,
      address: config.address,
      httpPort: config.httpPort,
      browserUrl: config.browserUrl,
      openUrl: config.browserUrl
    }
  };

  if (config.unregisterServiceWorker) {
    msg.startServerResponse.openUrl += UNREGISTER_SW_URL;
  } else {
    msg.startServerResponse.openUrl += '/';
  }

  process.send(msg);
}
