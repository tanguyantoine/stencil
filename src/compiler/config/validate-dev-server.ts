import { Config, DevServerConfig } from '../../declarations';
import { setBooleanConfig, setNumberConfig, setStringConfig } from './config-utils';


export function validateDevServer(config: Config): DevServerConfig {
  config.devServer = config.devServer || {};
  setBooleanConfig(config.devServer, 'startDevServer', false);

  setStringConfig(config.devServer, 'address', '0.0.0.0');
  setBooleanConfig(config.devServer, 'broadcast', false);
  setBooleanConfig(config.devServer, 'gzip', true);
  setNumberConfig(config.devServer, 'port', 3333);
  setBooleanConfig(config.devServer, 'liveReload', true);
  setBooleanConfig(config.devServer, 'openBrowser', true);
  setBooleanConfig(config.devServer, 'ssl', false);

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

  return config.devServer;
}
