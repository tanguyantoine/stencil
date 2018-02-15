import { Config, DevServerConfig } from '../../declarations';
import { setBooleanConfig, setNumberConfig, setStringConfig } from './config-utils';


export function validateDevServer(config: Config) {
  config.devServer = Object.assign({}, DEFAULT_DEV_SERVER_CONFIG, config.devServer || {});

  setBooleanConfig(config, 'startDevServer', false);

  if (!config.devServer.startDevServer) {
    return;
  }

  setStringConfig(config, 'address', '0.0.0.0');
  setBooleanConfig(config, 'broadcast', false);
  setNumberConfig(config, 'httpPort', 3333);
  setBooleanConfig(config, 'html5mode', true);
  setBooleanConfig(config, 'liveReload', true);
  setNumberConfig(config, 'liveReloadPort', 35729);
  setBooleanConfig(config, 'openBrowser', true);
  setBooleanConfig(config, 'ssl', false);
  setBooleanConfig(config, 'unregisterServiceWorker', true);

  config.devServer.protocol = config.devServer.ssl ? 'https' : 'http';

  if (!config.devServer.contentTypes) {
    const contentTypePath = config.sys.path.join(
      __dirname, '../dev-server/content-type-db.json'
    );
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
  openBrowser: true,
  ssl: false,
  startDevServer: false,
  unregisterServiceWorker: true
};
