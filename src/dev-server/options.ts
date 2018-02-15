import { Config } from '../declarations';
import * as path from 'path';


export function getOptions(config: Config) {
  const opts = Object.assign({}, DEFAULT_OPTIONS);

  if (typeof opts.root === 'string') {
    if (!path.isAbsolute(opts.root)) {
      opts.root = path.join(config.rootDir, opts.root);
    }
  } else {
    opts.root = config.wwwDir;
  }

  opts.protocol = opts.ssl ? 'https' : 'http';

  return opts;
}


export const DEFAULT_OPTIONS: DevServerOptions = {
  address: '0.0.0.0',
  broadcast: false,
  httpPort: 3333,
  html5mode: true,
  liveReload: true,
  liveReloadPort: 35729,
  open: true,
  ssl: false,
  unregisterServiceWorkers: true
};


export interface DevServerOptions {
  address: string;
  broadcast: boolean;
  contentType?: { [ext: string]: string };
  html5mode: boolean;
  httpPort: number;
  liveReload: boolean;
  liveReloadPort: number;
  open: boolean;
  protocol?: 'http' | 'https';
  root?: string;
  ssl: boolean;
  staticDir?: string;
  templateDir?: string;
  unregisterServiceWorkers: boolean;
}
