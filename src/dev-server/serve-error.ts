import { CompilerCtx, Config, HttpRequest } from '../declarations';
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


export async function serve404(config: Config, compilerCtx: CompilerCtx, req: HttpRequest, res: http.ServerResponse) {
  const headers = {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Expires': '0',
    'Content-Type': 'text/html'
  };

  let content = `File not found: ${req.pathname}`;

  const pathName = req.pathname.toLowerCase();

  if (pathName.endsWith('.js')) {
    headers['Content-Type'] = 'application/javascript';
    content = `// ${content}`;

  } else if (pathName.endsWith('.css')) {
    headers['Content-Type'] = 'text/css';
    content = `/** ${content} **/`;

  } else  {
    const tmpl404 = await compilerCtx.fs.readFile(path.join(config.devServer.devServerDir, 'templates/404.html'));
    content = tmpl404.replace('{content}', content);
  }

  res.writeHead(404, headers);
  res.write(content);
  res.end();
}
