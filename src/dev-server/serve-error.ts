import { CompilerCtx } from '../declarations';
import { DevServerOptions } from './options';
import * as http  from 'http';
import * as path  from 'path';


export function serve500(res: http.ServerResponse, errorMessage: string) {
  res.writeHead(500, {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Expires': '0',
    'Content-Type': 'text/plain'
  });
  res.write(errorMessage);
  res.end();
}


export async function serve404(opts: DevServerOptions, compilerCtx: CompilerCtx, reqPath: string, res: http.ServerResponse) {
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Expires': '0',
    'Content-Type': 'text/html'
  };

  let content = `File not found: ${reqPath}`;

  reqPath = reqPath.toLowerCase();

  if (reqPath.endsWith('.js')) {
    headers['Content-Type'] = 'application/javascript';
    content = `// ${content}`;

  } else if (reqPath.endsWith('.css')) {
    headers['Content-Type'] = 'text/css';
    content = `/** ${content} **/`;

  } else  {
    const tmpl404 = await compilerCtx.fs.readFile(path.join(opts.templateDir, '404.html'));
    content = tmpl404.replace('{content}', content);
  }

  res.writeHead(404, headers);
  res.write(content);
  res.end();
}
