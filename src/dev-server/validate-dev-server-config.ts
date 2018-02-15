import { Config, DevServerConfig } from '../declarations';
import * as path from 'path';


export function validateDevServerConfig(config: Config) {
  config.devServer = Object.assign({}, DEFAULT_DEV_SERVER_CONFIG, config.devServer || {});

  config.devServer.protocol = config.devServer.ssl ? 'https' : 'http';

  if (!config.devServer.contentTypes) {
    const contentTypePath = path.join(config.devServer.contentTypeJsonPath, 'content-type-db.json');
    config.devServer.contentTypes = require(contentTypePath);
  }
}


export const DEFAULT_DEV_SERVER_CONFIG: DevServerConfig = {
  address: '0.0.0.0',
  broadcast: false,
  httpPort: 3333,
  html5mode: true,
  liveReload: true,
  liveReloadPort: 35729,
  open: true,
  ssl: false,
  start: false,
  unregisterServiceWorkers: true
};
