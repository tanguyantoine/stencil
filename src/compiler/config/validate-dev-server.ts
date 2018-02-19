import { Config, DevServerConfig } from '../../declarations';
import { setBooleanConfig, setNumberConfig, setStringConfig } from './config-utils';


export function validateDevServer(config: Config): DevServerConfig {
  config.devServer = config.devServer || {};

  setBooleanConfig(config, 'startDevServer', false);

  if (!config.devServer.startDevServer) {
    return config.devServer;
  }

  setStringConfig(config.devServer, 'address', '0.0.0.0');
  setBooleanConfig(config.devServer, 'broadcast', false);
  setBooleanConfig(config.devServer, 'gzip', true);
  setNumberConfig(config.devServer, 'httpPort', 3333);
  setBooleanConfig(config.devServer, 'liveReload', true);
  setNumberConfig(config.devServer, 'liveReloadPort', 35729);
  setBooleanConfig(config.devServer, 'openBrowser', true);
  setBooleanConfig(config.devServer, 'ssl', false);
  setBooleanConfig(config.devServer, 'unregisterServiceWorker', true);

  if (config.devServer.historyApiFallback !== null && config.devServer.historyApiFallback !== false) {
    config.devServer.historyApiFallback = config.devServer.historyApiFallback || {};

    if (typeof config.devServer.historyApiFallback.index !== 'string') {
      config.devServer.historyApiFallback.index = 'index.html';
    }

    if (typeof config.devServer.historyApiFallback.disableDotRule !== 'boolean') {
      config.devServer.historyApiFallback.disableDotRule = false;
    }
  }

  setStringConfig(config.devServer, 'root', config.wwwDir);
  if (!config.sys.path.isAbsolute(config.devServer.root)) {
    config.devServer.root = config.sys.path.join(config.rootDir, config.devServer.root);
  }

  config.devServer.protocol = config.devServer.ssl ? 'https' : 'http';

  return config.devServer;
}
