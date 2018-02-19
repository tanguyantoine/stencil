import { DevServerConfig, FileSystem, HttpRequest } from '../declarations';
import { isStaticDevClient, serveFile, serveStaticDevClient } from './serve-file';
import { serve404 } from './serve-error';
import { serveDirectoryIndex } from './serve-directory-index';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';


export function createRequestHandler(config: DevServerConfig, fs: FileSystem) {

  return async function(incomingReq: http.IncomingMessage, res: http.ServerResponse) {
    const req = normalizeHttpRequest(config, incomingReq);

    if (req.pathname === '') {
      res.writeHead(302, { 'location': '/' });
      return res.end();
    }

    if (isStaticDevClient(req)) {
      return serveStaticDevClient(config, fs, req, res);
    }

    try {
      req.stats = await fs.stat(req.filePath);

      if (req.stats.isFile()) {
        return serveFile(config, fs, req, res);
      }

      if (req.stats.isDirectory()) {
        return serveDirectoryIndex(config, fs, req, res);
      }

    } catch (e) {}

    if (isValidHistoryApi(config, req)) {
      try {
        const indexFilePath = path.join(config.root, config.historyApiFallback.index);

        req.stats = await fs.stat(indexFilePath);
        if (req.stats.isFile()) {
          req.filePath = indexFilePath;
          return serveFile(config, fs, req, res);
        }

      } catch (e) {}
    }

    return serve404(config, fs, req, res);
  };
}


function normalizeHttpRequest(config: DevServerConfig, incomingReq: http.IncomingMessage) {
  const req: HttpRequest = {
    method: (incomingReq.method || 'GET').toUpperCase() as any,
    acceptHeader: (incomingReq.headers && typeof incomingReq.headers.accept === 'string' && incomingReq.headers.accept) || '',
    url: (incomingReq.url || '').trim() || ''
  };

  const parsedUrl = url.parse(req.url);
  const parts = (parsedUrl.pathname || '').replace(/\\/g, '/').split('/');

  req.pathname = parts.map(part => decodeURIComponent(part)).join('/');

  req.filePath = path.normalize(
    path.join(config.root,
      path.relative('/', req.pathname)
    )
  );

  return req;
}


function isValidHistoryApi(config: DevServerConfig, req: HttpRequest) {
  return !!config.historyApiFallback &&
         req.method === 'GET' &&
         (!config.historyApiFallback.disableDotRule && !req.pathname.includes('.')) &&
         req.acceptHeader.includes('text/html');
}
