import { Config } from '../declarations';
import * as path from 'path';
import * as url from 'url';


export function getRequestedPath(requestUrl: string) {
  const parsed = url.parse(requestUrl);

  decodeURIComponent(requestUrl);

  return decodePathname(parsed.pathname || '');
}


export function getFilePathFromUrl(config: Config, requestUrl: string) {
  const pathname = getRequestedPath(requestUrl);
  return path.normalize(
    path.join(config.wwwDir,
      path.relative('/', pathname)
    )
  );
}


function decodePathname(pathname: string) {
  const pieces = pathname.replace(/\\/g, '/').split('/');

  return pieces.map((piece) => {
    piece = decodeURIComponent(piece);

    if (process.platform === 'win32' && /\\/.test(piece)) {
      throw new Error('Invalid forward slash character');
    }

    return piece;
  }).join('/');
}
