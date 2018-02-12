import { mockCompilerCtx, mockConfig } from '../../../../testing/mocks';
import { CompilerCtx, Config } from '../../../../declarations';
import { createHttpRequestHandler } from '../request-handler';
import { DevServerOptions, getOptions } from '../options';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';


describe('request-handler', () => {

  let c: CompilerCtx;
  let config: Config;
  let opts: DevServerOptions;
  let req: http.ServerRequest;
  let res: TestServerResponse;
  const tmplDirPath = path.join(__dirname, '../assets/tmpl-dir.html');
  const tmpl404Path = path.join(__dirname, '../assets/tmpl-404.html');
  const tmpl500Path = path.join(__dirname, '../assets/tmpl-500.html');
  const tmplDir = fs.readFileSync(tmplDirPath, 'utf8');
  const tmpl404 = fs.readFileSync(tmpl404Path, 'utf8');
  const tmpl500 = fs.readFileSync(tmpl404Path, 'utf8');

  beforeEach(async () => {
    c = mockCompilerCtx();
    await c.fs.writeFile(tmplDirPath, tmplDir);
    await c.fs.writeFile(tmpl404Path, tmpl404);
    await c.fs.writeFile(tmpl500Path, tmpl500);
    await c.fs.commit();
    config = mockConfig();
    opts = getOptions(config);
    req = {} as any;
    res = {} as any;

    res.writeHead = (statusCode, headers) => {
      res.$statusCode = statusCode;
      res.$headers = headers;
      res.$contentType = headers['Content-Type'];
    };

    res.write = (content) => {
      res.$contentWrite = content;
      return true;
    };

    res.end = () => {
      res.$content = res.$contentWrite;
    };
  });

  describe('html5mode', () => {

    it('should not assume .html suffix when not html5mode', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`
      });
      await c.fs.commit();
      opts.html5mode = false;
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
      expect(res.$content).toContain('tmpl-404');
    });

    it('should not assume .html suffix when no text/html in request header accept', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: '*/*'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
    });

    it('should list directory when ended in slash and not in html5mode', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`,
        '/www/about-us/index.html': `about-us-index`
      });
      await c.fs.commit();
      opts.html5mode = false;
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('tmpl-dir');
      expect(res.$contentType).toBe('text/html');
    });

    it('should redirect directory w/ slash when not in html5mode', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`,
        '/www/about-us/index.html': `about-us-index`
      });
      await c.fs.commit();
      opts.html5mode = false;
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/about-us/');
    });

    it('should prefer actual .html over directory/index.html file', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`,
        '/www/about-us/index.html': `about-us-index`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$content).toContain('aboutus');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('should assume .html suffix with text/html in request header accept', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `aboutus`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$content).toContain('aboutus');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('get directory index.html', async () => {
      await c.fs.writeFiles({
        '/www/about-us/index.html': `aboutus`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/about-us';

      await handler(req, res);
      expect(res.$content).toContain('aboutus');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

  });

  describe('error not found static files', () => {

    it('not find js file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.js': `alert("hi");`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file2.js';

      await handler(req, res);
      expect(res.$content).toBe('// File not found: /scripts/file2.js');
      expect(res.$contentType).toBe('application/javascript');
      expect(res.$statusCode).toBe(404);
    });

  });

  describe('302 redirect', () => {

    it('302 when a directory path, but url doesnt end in /', async () => {
      await c.fs.writeFiles({
        '/www/assets/styles.css': `/* hi */`,
        '/www/assets/scripts.js': `// hi`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/assets';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/assets/');
    });

  });

  describe('root index', () => {

    it('serve directory listing when no index.html', async () => {
      await c.fs.writeFiles({
        '/www/styles.css': `/* hi */`,
        '/www/scripts.js': `// hi`,
        '/www/.gitignore': `// gitignore`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/';

      await handler(req, res);
      expect(res.$content).toContain('tmpl-dir');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('serve root index.html', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/';

      await handler(req, res);
      expect(res.$content).toContain('hello');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('serve root index.html w/ querystring', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/?qs=123';

      await handler(req, res);
      expect(res.$content).toContain('hello');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('302 redirect to / when no path at all', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/');
    });

    it('302 redirect to / when path is /index.html at all', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/index.html';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/');
    });

  });

  describe('serve static text files', () => {

    it('should load js file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.js': `alert("hi");`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file1.js';

      await handler(req, res);
      expect(res.$content).toContain('alert("hi");');
      expect(res.$contentType).toBe('application/javascript');
      expect(res.$statusCode).toBe(200);
    });

    it('should load css file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.css': `body{color:red}`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file1.css';

      const content = await handler(req, res);
      expect(res.$content).toBe('body{color:red}');
      expect(res.$contentType).toBe('text/css');
      expect(res.$statusCode).toBe(200);
    });

    it('should load svg file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.svg': `<svg></svg>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file1.svg';

      const content = await handler(req, res);
      expect(res.$content).toBe('<svg></svg>');
      expect(res.$contentType).toBe('image/svg+xml');
      expect(res.$statusCode).toBe(200);
    });

    it('should load html file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.html': `<html></html>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file1.html';

      const content = await handler(req, res);
      expect(res.$content).toContain('<html></html>');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

    it('should load file w/ querystring', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.html': `<html></html>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(opts, c);

      req.url = '/scripts/file1.html?qs=1234';

      const content = await handler(req, res);
      expect(res.$content).toContain('<html></html>');
      expect(res.$contentType).toBe('text/html');
      expect(res.$statusCode).toBe(200);
    });

  });

});

interface TestServerResponse extends http.ServerResponse {
  $statusCode: number;
  $headers: any;
  $contentWrite: string;
  $content: string;
  $contentType: string;
}
