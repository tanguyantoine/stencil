import { CompilerCtx, Config, HttpRequest } from '../declarations';
import { serve404, serve500 } from './serve-error';
import { serveFile } from './serve-file';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';


export async function serveDirectoryIndex(config: Config, compilerCtx: CompilerCtx, req: HttpRequest, res: http.ServerResponse) {

  try {
    const indexFilePath = path.join(req.filePath, 'index.html');

    const stat = await compilerCtx.fs.stat(indexFilePath);
    if (stat.isFile) {
      req.filePath = indexFilePath;
      return serveFile(config, compilerCtx, req, res);
    }

  } catch (e) {}

  if (!req.pathname.endsWith('/')) {
    res.writeHead(302, {
      'location': req.pathname + '/'
    });
    return res.end();
  }

  try {
    let items = await compilerCtx.fs.readdir(req.filePath, { recursive: false });

    try {
      const dirTemplatePath = path.join(config.devServer.templateDir, 'directory-index.html');
      const dirTemplate = await compilerCtx.fs.readFile(dirTemplatePath);

      items = items.filter(f => !f.itemPath.startsWith('.'));

      const fileHtml = items
        .map(item => {
          return (
            `<div>
              <div class="icon-${item.isDirectory ? 'directory' : 'file'}"></div>
              <div>
                <a class="link-${item.isDirectory ? 'directory' : 'file'}"
                  href="${url.resolve(req.pathname, item.itemPath)}">${item.itemPath}</a>
              </div>
            </div>`
          );
        })
        .join('\n');

      const templateHtml = dirTemplate
        .replace('{directory}', req.pathname)
        .replace('{files}', fileHtml)
        .replace('{linked-path}', req.pathname.replace(/\//g, ' / '));

      res.writeHead(200, {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Expires': '0',
        'Content-Type': 'text/html'
      });
      res.write(templateHtml);
      res.end();

    } catch (e) {
      serve500(res, e);
    }

  } catch (e) {
    serve404(config, compilerCtx, req, res);
  }
}
