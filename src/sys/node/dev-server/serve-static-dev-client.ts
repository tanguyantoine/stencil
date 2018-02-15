import { CompilerCtx } from '../../../declarations';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';


export async function serveStaticDevClient(compilerCtx: CompilerCtx, url: string, res: http.ServerResponse) {
  let filePath: string;

  if (isDevServerInitialLoad(url)) {
    filePath = path.join(__dirname, 'template/initial-load.html');

  } else {
    const urlPath = url.replace(DEV_SERVER_URL + '/', '');
    filePath = path.join(__dirname, 'static', urlPath);
  }

  return serveFile(compilerCtx, filePath, res);
}



export function isStaticDevClient(url: string) {
  return url.startsWith(DEV_SERVER_URL);
}


function isDevServerInitialLoad(url: string) {
  return url === DEV_SERVER_INITIAL_URL;
}

const DEV_SERVER_URL = '/__dev-server';

const DEV_SERVER_INITIAL_URL = `${DEV_SERVER_URL}-init`;
