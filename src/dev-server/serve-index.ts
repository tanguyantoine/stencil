import { CompilerCtx, Config } from '../declarations';
import { serveDirContents } from './serve-dir-contents';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';


export async function serveIndex(config: Config, compilerCtx: CompilerCtx, dirPath: string, reqPath: string, res: http.ServerResponse) {
  if (config.devServer.html5mode) {
    const htmlFilePath = dirPath + '.html';
    try {
      const stat = await compilerCtx.fs.stat(htmlFilePath);

      if (stat.isFile) {
        return serveFile(config, compilerCtx, reqPath, htmlFilePath, res);
      }
    } catch (e) {}

    const indexFilePath = path.join(dirPath, 'index.html');
    try {
      const stat = await compilerCtx.fs.stat(indexFilePath);

      if (stat.isFile) {
        return serveFile(config, compilerCtx, reqPath, indexFilePath, res);
      }

    } catch (e) {}
  }

  // If the request is to a directory but does not end in slash then redirect to use a slash
  if (!reqPath.endsWith('/')) {
    res.writeHead(302, {
      'location': reqPath + '/'
    });
    return res.end();
  }

  return serveDirContents(config, compilerCtx, reqPath, dirPath, res);
}
