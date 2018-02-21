import { createHttpServer } from './server-http';
import { createWebSocketServer } from './server-web-socket';
import { DevServerConfig, DevServerMessage, FileSystem } from '../declarations';
import { findClosestOpenPort } from './find-closest-port';
import { getClientSideConfig } from './util';


export async function startDevServer(config: DevServerConfig, fs: FileSystem) {
  try {
    config.port = await findClosestOpenPort(config.address, config.port);

    const server = await createHttpServer(config, fs);

    createWebSocketServer(server);

    server.listen(config.port, config.address);

    const msg: DevServerMessage = {
      startServerResponse: getClientSideConfig(config)
    };

    process.send(msg);

  } catch (e) {
    console.error(e);
  }
}
