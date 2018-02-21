import { DevServerConfig, FileSystem } from '../declarations';
import { createRequestHandler } from './request-handler';
import { getSSL } from './ssl';
import * as http from 'http';
import * as https from 'https';


export async function createHttpServer(config: DevServerConfig, fs: FileSystem) {
  const reqHandler = createRequestHandler(config, fs);

  let server: http.Server;

  if (config.ssl) {
    server = https.createServer(await getSSL(), reqHandler) as any;

  } else {
    server = http.createServer(reqHandler);
  }

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

  return server;
}
