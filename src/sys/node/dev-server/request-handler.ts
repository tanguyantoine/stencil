import { CompilerCtx } from '../../../declarations';
import { DevServerOptions } from './options';
import { getFileFromPath, getRequestedPath } from './utils';
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

    if (isStaticDevClient(url)) {
      return serveStaticDevClient(compilerCtx, url, res);
    }

    let filePath = getFileFromPath(opts.root, url);

    try {
      const stat = await compilerCtx.fs.stat(filePath);

      if (stat.isFile) {
        return serveFile(compilerCtx, filePath, res);
      }

      if (stat.isDirectory) {
        return serveIndex(opts, compilerCtx, filePath, reqPath, res);
      }

    } catch (e) {

      if (reqPath === '/') {
        return serveIndex(opts, compilerCtx, reqPath, filePath, res);
      }

      if (opts.html5mode) {
        if (req.headers && req.headers.accept && req.headers.accept.includes('text/html')) {
          filePath += '.html';
          return serveFile(compilerCtx, filePath, res);
        }
      }
    }

    return serve404(opts, compilerCtx, reqPath, res);
  };
}
