import { CompilerCtx } from '../../../declarations';
import { DEV_SERVER_INITIAL_URL, DevServerOptions } from './options';
import { injectDevClientHtml } from './inject-dev-client';
import * as fs  from 'fs';
import * as http  from 'http';
import * as mimeTypes from 'mime-types';


export async function serveFile(opts: DevServerOptions, compilerCtx: CompilerCtx, filePath: string, res: http.ServerResponse) {
  const stat = await compilerCtx.fs.stat(filePath);

  let contentType = 'application/octet-stream';
  try {
    const mimeType = mimeTypes.lookup(filePath);
    if (mimeType !== false) {
      contentType = mimeType;
    }
  } catch (e) {}

  res.writeHead(200, {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Expires': '0',
    'Content-Type': contentType,
    'Content-Length': stat.size
  });

  if (isTextFile(filePath)) {
    // easy text file, use the internal cache
    let content = await compilerCtx.fs.readFile(filePath);

    if (isHtmlFile(filePath)) {
      content = injectDevClientHtml(opts, content);
    }

    res.write(content);
    res.end();

  } else {
    // non-well-known text file, probably best we use a stream
    fs.createReadStream(filePath).pipe(res);
  }
}


export async function serveDevServerAsset(url: string, res: http.ServerResponse) {

}


function isDevServerInitialLoad(url: string) {
  return url === DEV_SERVER_INITIAL_URL;
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
