import { CompilerCtx } from '../declarations';
import { DevServerOptions } from './options';
import { serve500 } from './serve-error';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';


export async function serveDirContents(opts: DevServerOptions, compilerCtx: CompilerCtx, reqPath: string, dirPath: string, res: http.ServerResponse) {
  try {
    let items = await compilerCtx.fs.readdir(dirPath, { recursive: false });

    const dirTemplatePath = path.join(opts.templateDir, 'directory-listing.html');
    const dirTemplate = await compilerCtx.fs.readFile(dirTemplatePath);

    items = items.filter(f => !f.itemPath.startsWith('.'));

    const fileHtml = items
      .map(item => {
        return (
          `<div>
            <div class="icon-${item.isDirectory ? 'directory' : 'file'}"></div>
            <div>
              <a class="link-${item.isDirectory ? 'directory' : 'file'}" href="${url.resolve(reqPath, item.itemPath)}">${item.itemPath}</a>
            </div>
          </div>`
        );
      })
      .join('\n');

    const templateHtml = dirTemplate
      .replace('{directory}', dirPath)
      .replace('{files}', fileHtml)
      .replace('{linked-path}', reqPath.replace(/\//g, ' / '));

    res.writeHead(200, {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Expires': '0',
      'Content-Type': 'text/html'
    });
    res.write(templateHtml);
    res.end();

  } catch (e) {
    return serve500(res, e.toString());
  }
}
