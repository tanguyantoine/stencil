import { CompilerCtx, Config, HttpRequest } from '../declarations';
import { isStaticDevClient, serveFile, serveStaticDevClient } from './serve-file';
import { serve404 } from './serve-error';
import { serveDirectoryIndex } from './serve-directory-index';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';


export function createHttpRequestHandler(config: Config, compilerCtx: CompilerCtx) {

  return async function(incomingReq: http.IncomingMessage, res: http.ServerResponse) {
    const req = normalizeHttpRequest(config, incomingReq);

    if (req.pathname === '') {
      res.writeHead(302, { 'location': '/' });
      return res.end();
    }

    if (isStaticDevClient(req)) {
      return serveStaticDevClient(config, compilerCtx, req, res);
    }

    try {
      const stat = await compilerCtx.fs.stat(req.filePath);

      if (stat.isFile) {
        return serveFile(config, compilerCtx, req, res);
      }

      if (stat.isDirectory) {
        return serveDirectoryIndex(config, compilerCtx, req, res);
      }

    } catch (e) {}

    if (isValidHistoryApi(config, req)) {
      try {
        const indexFilePath = path.join(config.wwwDir, config.devServer.historyApiFallback.index);

        const stat = await compilerCtx.fs.stat(indexFilePath);
        if (stat.isFile) {
          req.filePath = indexFilePath;
          return serveFile(config, compilerCtx, req, res);
        }

      } catch (e) {}
    }

    return serve404(config, compilerCtx, req, res);
  };
}


function normalizeHttpRequest(config: Config, incomingReq: http.IncomingMessage) {
  const req: HttpRequest = {
    method: (incomingReq.method || 'GET').toUpperCase() as any,
    acceptHeader: (incomingReq.headers && typeof incomingReq.headers.accept === 'string' && incomingReq.headers.accept) || '',
    url: (incomingReq.url || '').trim() || ''
  };

  const parsedUrl = url.parse(req.url);
  const parts = (parsedUrl.pathname || '').replace(/\\/g, '/').split('/');

  req.pathname = parts.map(part => decodeURIComponent(part)).join('/');

  req.filePath = path.normalize(
    path.join(config.wwwDir,
      path.relative('/', req.pathname)
    )
  );

  return req;
}


function isValidHistoryApi(config: Config, req: HttpRequest) {
  return !!config.devServer.historyApiFallback &&
         req.method === 'GET' &&
         (!config.devServer.historyApiFallback.disableDotRule && !req.pathname.includes('.')) &&
         req.acceptHeader.includes('text/html');
}
