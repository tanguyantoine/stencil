import { CompilerCtx, Config } from '../declarations';
import { getFilePathFromUrl, getRequestedPath } from './utils';
import { serveFile } from './serve-file';
import { isStaticDevClient, serveStaticDevClient } from './serve-static-dev-client';
import { serve404 } from './serve-error';
import { serveIndex } from './serve-index';
import * as http from 'http';


export function createHttpRequestHandler(config: Config, compilerCtx: CompilerCtx) {

  return async function(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = (req.url || '').trim();
    const reqPath = getRequestedPath(url);

    if (reqPath === '') {
      res.writeHead(302, { 'location': '/' });
      return res.end();
    }

    if (isStaticDevClient(reqPath)) {
      return serveStaticDevClient(config, compilerCtx, reqPath, res);
    }

    let filePath = getFilePathFromUrl(config, url);

    try {
      if (reqPath === '/') {
        return serveIndex(config, compilerCtx, filePath, reqPath, res);
      }

      const stat = await compilerCtx.fs.stat(filePath);

      if (stat.isFile) {
        return serveFile(config, compilerCtx, reqPath, filePath, res);
      }

      if (stat.isDirectory) {
        return serveIndex(config, compilerCtx, filePath, reqPath, res);
      }

    } catch (e) {

      if (config.devServer.html5mode) {
        if (req.headers && typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html')) {
          filePath += '.html';
          return serveFile(config, compilerCtx, reqPath, filePath, res);
        }
      }
    }

    return serve404(config, compilerCtx, reqPath, res);
  };
}
