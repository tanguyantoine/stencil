import { CompilerCtx, Config, HttpRequest } from '../declarations';
import { getContentType } from './content-type';
import { serve404, serve500 } from './serve-error';
import * as fs  from 'fs';
import * as http  from 'http';
import * as path from 'path';


export async function serveFile(config: Config, compilerCtx: CompilerCtx, req: HttpRequest, res: http.ServerResponse) {
  try {
    const stat = await compilerCtx.fs.stat(req.filePath);

    try {
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(config, req.filePath),
        'Content-Length': stat.size
      });

      if (isTextFile(req.filePath)) {
        // easy text file, use the internal cache
        let content = await compilerCtx.fs.readFile(req.filePath);

        if (isHtmlFile(req.filePath)) {
          // auto inject our dev server script
          content += '\n' + DEV_SERVER_SCRIPT;
        }

        res.write(content);
        res.end();

      } else {
        // non-well-known text file or other file, probably best we use a stream
        fs.createReadStream(req.filePath).pipe(res);
      }

    } catch (e) {
      serve500(res, e);
    }

  } catch (e) {
    serve404(config, compilerCtx, req, res);
  }
}

export async function serveStaticDevClient(config: Config, compilerCtx: CompilerCtx, req: HttpRequest, res: http.ServerResponse) {
  if (isDevServerInitialLoad(req)) {
    req.filePath = path.join(config.devServer.devServerDir, 'templates/initial-load.html');

  } else {
    const staticFile = req.pathname.replace(DEV_SERVER_URL + '/', '');
    req.filePath = path.join(config.devServer.devServerDir, 'static', staticFile);
  }

  return serveFile(config, compilerCtx, req, res);
}


function isHtmlFile(filePath: string) {
  filePath = filePath.toLowerCase().trim();
  return (filePath.endsWith('.html') || filePath.endsWith('.htm'));
}


function isTextFile(filePath: string) {
  filePath = filePath.toLowerCase().trim();
  return TEXT_EXT.some(ext => filePath.endsWith(ext));
}

const TEXT_EXT = ['.js', '.css', '.html', '.htm', '.svg', '.txt'];


export function isStaticDevClient(req: HttpRequest) {
  return req.pathname.startsWith(DEV_SERVER_URL);
}


function isDevServerInitialLoad(req: HttpRequest) {
  return req.pathname === UNREGISTER_SW_URL;
}


export const DEV_SERVER_URL = '/__dev-server';

export const UNREGISTER_SW_URL = `${DEV_SERVER_URL}-init`;

const DEV_SERVER_SCRIPT = `<script src="${DEV_SERVER_URL}/dev-server.js" data-dev-server-script></script>`;
