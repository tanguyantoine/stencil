import { CompilerCtx } from '../declarations';
import { DevServerOptions } from './options';
import { getFilePathFromUrl, getRequestedPath } from './utils';
import { serveFile } from './serve-file';
import { isStaticDevClient, serveStaticDevClient } from './serve-static-dev-client';
import { serve404 } from './serve-error';
import { serveIndex } from './serve-index';
import * as http from 'http';


export function createHttpRequestHandler(opts: DevServerOptions, compilerCtx: CompilerCtx) {

  return async function(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = (req.url || '').trim();
    const reqPath = getRequestedPath(url);

    if (reqPath === '') {
      res.writeHead(302, { 'location': '/' });
      return res.end();
    }

    if (isStaticDevClient(reqPath)) {
      return serveStaticDevClient(opts, compilerCtx, reqPath, res);
    }

    let filePath = getFilePathFromUrl(opts, url);

    try {
      const stat = await compilerCtx.fs.stat(filePath);

      if (stat.isFile) {
        return serveFile(opts, compilerCtx, reqPath, filePath, res);
      }

      if (stat.isDirectory) {
        return serveIndex(opts, compilerCtx, filePath, reqPath, res);
      }

    } catch (e) {

      if (reqPath === '/') {
        return serveIndex(opts, compilerCtx, reqPath, filePath, res);
      }

      if (opts.html5mode) {
        if (req.headers && typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html')) {
          filePath += '.html';
          return serveFile(opts, compilerCtx, reqPath, filePath, res);
        }
      }
    }

    return serve404(opts, compilerCtx, reqPath, res);
  };
}
