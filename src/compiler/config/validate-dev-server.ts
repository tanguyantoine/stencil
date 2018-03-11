import { Config, DevServerConfig } from '../../declarations';
import { pathJoin } from '../util';
import { setBooleanConfig, setNumberConfig, setStringConfig } from './config-utils';


export function validateDevServer(config: Config): DevServerConfig {
  config.devServer = config.devServer || {};
  setBooleanConfig(config.devServer, 'startDevServer', null, false);

  setStringConfig(config.devServer, 'address', '0.0.0.0');
  setBooleanConfig(config.devServer, 'broadcast', null, false);
  setBooleanConfig(config.devServer, 'gzip', null, true);
  setNumberConfig(config.devServer, 'port', null, 3333);
  setBooleanConfig(config.devServer, 'liveReload', null, true);
  setBooleanConfig(config.devServer, 'openBrowser', null, true);
  setBooleanConfig(config.devServer, 'ssl', null, false);

  if (config.devServer.historyApiFallback !== null && config.devServer.historyApiFallback !== false) {
    config.devServer.historyApiFallback = config.devServer.historyApiFallback || {};

    if (typeof config.devServer.historyApiFallback.index !== 'string') {
      config.devServer.historyApiFallback.index = 'index.html';
    }

    if (typeof config.devServer.historyApiFallback.disableDotRule !== 'boolean') {
      config.devServer.historyApiFallback.disableDotRule = false;
    }
  }

  let wwwDir: string = null;
  const outputTarget = config.outputTargets.find(o => o.type === 'www');
  if (!outputTarget) {
    throw new Error(`dev server missing www output target`);
  }

  wwwDir = outputTarget.path;

  setStringConfig(config.devServer, 'root', wwwDir);

  if (!config.sys.path.isAbsolute(config.devServer.root)) {
    config.devServer.root = pathJoin(config, config.rootDir, config.devServer.root);
  }

  return config.devServer;
}
