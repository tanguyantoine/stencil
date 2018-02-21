import { DevServerConfig, FileSystem, HttpRequest } from '../declarations';
import { DEV_SERVER_URL, getContentType, isDevServerInitialLoad, isHtmlFile } from './util';
import { injectDevServerScripts } from './inject-scripts';
import { serve404 } from './serve-error';
import * as http  from 'http';
import * as path from 'path';
import { Buffer } from 'buffer';


export async function serveFile(config: DevServerConfig, fs: FileSystem, req: HttpRequest, res: http.ServerResponse, initialDevServerLoad?: boolean) {
  try {
    if (isHtmlFile(req.filePath)) {
      // easy text file, use the internal cache
      let content = await fs.readFile(req.filePath);

      // auto inject our dev server script
      content += `${injectDevServerScripts(config, initialDevServerLoad)}`;

      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(config, req.filePath),
        'Content-Length': Buffer.byteLength(content, 'utf8')
      });

      res.write(content);
      res.end();

    } else {
      // non-well-known text file or other file, probably best we use a stream
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(config, req.filePath),
        'Content-Length': req.stats.size
      });

      fs.createReadStream(req.filePath).pipe(res);
    }

  } catch (e) {
    serve404(config, fs, req, res);
  }
}


export async function serveStaticDevClient(config: DevServerConfig, fs: FileSystem, req: HttpRequest, res: http.ServerResponse) {
  const initialLoad = isDevServerInitialLoad(req);

  if (initialLoad) {
    req.filePath = path.join(config.devServerDir, 'templates/initial-load.html');

  } else {
    const staticFile = req.pathname.replace(DEV_SERVER_URL + '/', '');
    req.filePath = path.join(config.devServerDir, 'static', staticFile);
  }

  req.stats = await fs.stat(req.filePath);

  return serveFile(config, fs, req, res, initialLoad);
}
