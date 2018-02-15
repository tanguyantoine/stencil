import { CompilerCtx, Config } from '../declarations';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';


export async function serveStaticDevClient(config: Config, compilerCtx: CompilerCtx, reqPath: string, res: http.ServerResponse) {
  let filePath: string;

  if (isDevServerInitialLoad(reqPath)) {
    filePath = path.join(config.devServer.templateDir, 'initial-load.html');

  } else {
    const urlPath = reqPath.replace(DEV_SERVER_URL + '/', '');
    filePath = path.join(config.devServer.staticDir, urlPath);
  }

  return serveFile(config, compilerCtx, reqPath, filePath, res);
}


export function isStaticDevClient(url: string) {
  return url.startsWith(DEV_SERVER_URL);
}


function isDevServerInitialLoad(url: string) {
  return url === UNREGISTER_SW_URL;
}

export const DEV_SERVER_URL = '/__dev-server';

export const UNREGISTER_SW_URL = `${DEV_SERVER_URL}-init`;
