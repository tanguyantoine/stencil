import { Config } from '../../../declarations';
import * as path from 'path';


export function getOptions(config: Config) {
  const opts = Object.assign({}, DEFAULT_OPTIONS);

  if (!path.isAbsolute(opts.root)) {
    opts.root = path.join(config.rootDir, opts.root);
  }

  if (!path.isAbsolute(opts.devAssetsDir)) {
    opts.devAssetsDir = path.join(__dirname, opts.devAssetsDir);
  }

  opts.protocol = opts.ssl ? 'http' : 'https';

  opts.additionalJsScripts = opts.additionalJsScripts || [];

  opts.additionalJsScripts.push(...DEFAULT_DEV_SCRIPTS);

  return opts;
}


export const DEFAULT_OPTIONS: DevServerOptions = {
  additionalJsScripts: [],
  address: '0.0.0.0',
  broadcast: false,
  devAssetsDir: 'assets',
  httpPort: 3333,
  html5mode: true,
  liveReload: true,
  liveReloadPort: 35729,
  open: true,
  root: 'www',
  ssl: false,
  unregisterServiceWorkers: true
};


export interface DevServerOptions {
  additionalJsScripts: string[];
  address: string;
  broadcast: boolean;
  devAssetsDir: string;
  html5mode: boolean;
  httpPort: number;
  liveReload: boolean;
  liveReloadPort: number;
  open: boolean;
  protocol?: 'http' | 'https';
  root: string;
  ssl: boolean;
  unregisterServiceWorkers: boolean;
}

export const DEV_SERVER_URL = '/__dev-server__';

export const DEV_SERVER_INITIAL_URL = `${DEV_SERVER_URL}-initial-build`;

const DEFAULT_DEV_SCRIPTS = [
  `${DEV_SERVER_URL}/dev-client.js`
];
