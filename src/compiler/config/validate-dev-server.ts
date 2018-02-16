import { Config } from '../../declarations';
import { setBooleanConfig, setNumberConfig, setStringConfig } from './config-utils';


export function validateDevServer(config: Config) {
  config.devServer = config.devServer || {};

  setBooleanConfig(config, 'startDevServer', false);

  if (!config.devServer.startDevServer) {
    return;
  }

  setStringConfig(config.devServer, 'address', '0.0.0.0');
  setBooleanConfig(config.devServer, 'broadcast', false);
  setNumberConfig(config.devServer, 'httpPort', 3333);
  setBooleanConfig(config.devServer, 'html5mode', true);
  setBooleanConfig(config.devServer, 'liveReload', true);
  setNumberConfig(config.devServer, 'liveReloadPort', 35729);
  setBooleanConfig(config.devServer, 'openBrowser', true);
  setBooleanConfig(config.devServer, 'ssl', false);
  setBooleanConfig(config.devServer, 'unregisterServiceWorker', true);

  config.devServer.protocol = config.devServer.ssl ? 'https' : 'http';

  if (!config.devServer.contentTypes) {
    const contentTypePath = config.sys.path.join(
      __dirname, '../dev-server/content-type-db.json'
    );
    config.devServer.contentTypes = require(contentTypePath);
  }
}
