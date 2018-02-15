import { CompilerCtx } from '../declarations';
import { DevServerOptions } from './options';
import { getContentType } from './content-type';
import { injectDevClientHtml } from './inject-dev-client';
import { serve404, serve500 } from './serve-error';
import * as fs  from 'fs';
import * as http  from 'http';


export async function serveFile(opts: DevServerOptions, compilerCtx: CompilerCtx, reqPath: string, filePath: string, res: http.ServerResponse) {
  try {
    const stat = await compilerCtx.fs.stat(filePath);

    try {
      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': getContentType(opts, filePath),
        'Content-Length': stat.size
      });

      if (isTextFile(filePath)) {
        // easy text file, use the internal cache
        let content = await compilerCtx.fs.readFile(filePath);

        if (isHtmlFile(filePath)) {
          content = injectDevClientHtml(content);
        }

        res.write(content);
        res.end();

      } else {
        // non-well-known text file or other file, probably best we use a stream
        fs.createReadStream(filePath).pipe(res);
      }

    } catch (e) {
      serve500(res, e);
    }

  } catch (e) {
    serve404(opts, compilerCtx, reqPath, res);
  }
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
