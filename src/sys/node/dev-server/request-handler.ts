import { CompilerCtx } from '../../../declarations';
import { DEV_SERVER_URL, DevServerOptions } from './options';
import { getFileFromPath, getRequestedPath } from './utils';
import { serveDevServerAsset, serveFile } from './serve-file';
import { serve404 } from './serve-error';
import { serveIndex } from './serve-index';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as url from 'url';


export function createHttpRequestHandler(opts: DevServerOptions, compilerCtx: CompilerCtx) {

  return async function(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = (req.url || '').trim();
    const reqPath = getRequestedPath(url);
    let filePath = getFileFromPath(opts.root, url);

    if (reqPath === '' || reqPath === '/index.html') {
      res.writeHead(302, {
        'location': '/'
      });
      return res.end();
    }

    if (isDevServerAsset(url)) {
      return serveDevServerAsset(url, res);
    }

    try {
      const stat = await compilerCtx.fs.stat(filePath);

      if (stat.isFile) {
        return serveFile(opts, compilerCtx, filePath, res);
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
          return serveFile(opts, compilerCtx, filePath, res);
        }
      }
    }

    return serve404(opts, compilerCtx, reqPath, res);
  };
}


function getJsScriptsMap(opts: DevServerOptions) {
  return opts.additionalJsScripts.reduce((map, fileUrl: string): { [key: string ]: string } => {
    const urlParts = url.parse(fileUrl);
    if (urlParts.host) {
      map[fileUrl] = fileUrl;
    } else {
      const baseFileName = path.basename(fileUrl);
      map[path.join(DEV_SERVER_URL, 'js_includes', baseFileName)] = path.resolve(process.cwd(), fileUrl);
    }
    return map;
  }, <JsScriptsMap>{});
}


function isDevServerAsset(url: string) {
  return url.startsWith(DEV_SERVER_URL);
}


export interface JsScriptsMap {
  [key: string ]: string;
}
