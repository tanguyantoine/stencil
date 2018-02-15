import { CompilerCtx } from '../declarations';
import { DevServerOptions } from './options';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';


export async function serveStaticDevClient(opts: DevServerOptions, compilerCtx: CompilerCtx, reqPath: string, res: http.ServerResponse) {
  let filePath: string;

  if (isDevServerInitialLoad(reqPath)) {
    filePath = path.join(opts.templateDir, 'initial-load.html');

  } else {
    const urlPath = reqPath.replace(DEV_SERVER_URL + '/', '');
    filePath = path.join(opts.staticDir, urlPath);
  }

  return serveFile(opts, compilerCtx, reqPath, filePath, res);
}


export function isStaticDevClient(url: string) {
  return url.startsWith(DEV_SERVER_URL);
}


function isDevServerInitialLoad(url: string) {
  return url === DEV_SERVER_INITIAL_URL;
}

export const DEV_SERVER_URL = '/__dev-server';

const DEV_SERVER_INITIAL_URL = `${DEV_SERVER_URL}-init`;
