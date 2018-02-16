import { mockCompilerCtx, mockConfig } from '../../testing/mocks';
import { CompilerCtx, Config } from '../../declarations';
import { createHttpRequestHandler } from '../request-handler';
import { validateDevServer } from '../../compiler/config/validate-dev-server';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';


describe('request-handler', () => {

  let c: CompilerCtx;
  let config: Config;
  let req: http.ServerRequest;
  let res: TestServerResponse;
  const tmplDirPath = path.join(__dirname, '../templates/directory-index.html');
  const tmpl404Path = path.join(__dirname, '../templates/404.html');
  const tmplDir = fs.readFileSync(tmplDirPath, 'utf8');
  const tmpl404 = fs.readFileSync(tmpl404Path, 'utf8');
  const contentTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'svg': 'image/svg+xml'
  };

  beforeEach(async () => {
    c = mockCompilerCtx();
    await c.fs.writeFile(tmplDirPath, tmplDir);
    await c.fs.writeFile(tmpl404Path, tmpl404);
    await c.fs.commit();
    config = mockConfig();

    config.devServer = {
      startDevServer: true,
      contentTypes: contentTypes,
      staticDir: path.join(__dirname, '../static'),
      templateDir: path.join(__dirname, '../templates')
    };

    validateDevServer(config);
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

  describe('historyApiFallback', () => {

    it('should load historyApiFallback index.html when dot in the url disableDotRule true', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html',
        disableDotRule: true
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: '*/*'
      };
      req.url = '/about.us';
      req.method = 'GET';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
    });

    it('should not load historyApiFallback index.html when dot in the url', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html'
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: '*/*'
      };
      req.url = '/about.us';
      req.method = 'GET';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
    });

    it('should not load historyApiFallback index.html when no text/html accept header', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html'
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: '*/*'
      };
      req.url = '/about-us';
      req.method = 'GET';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
    });

    it('should not load historyApiFallback index.html when not GET request', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html'
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';
      req.method = 'POST';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
    });

    it('should load historyApiFallback index.html when no trailing slash', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html'
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('root-index');
      expect(res.$contentType).toBe('text/html');
    });

    it('should load historyApiFallback index.html when trailing slash', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `root-index`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {
        index: 'index.html'
      };
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('root-index');
      expect(res.$contentType).toBe('text/html');
    });

    it('should list directory when ended in slash and not using historyApiFallback', async () => {
      await c.fs.writeFiles({
        '/www/about-us/somefile1.html': `somefile1`,
        '/www/about-us/somefile2.html': `somefile2`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = null;
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('tmpl-dir');
      expect(res.$contentType).toBe('text/html');
    });

  });

  describe('serve directory index', () => {

    it('should load index.html in directory', async () => {
      await c.fs.writeFiles({
        '/www/about-us.html': `about-us.html page`,
        '/www/about-us/index.html': `about-us-index-directory`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = null;
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('about-us-index-directory');
      expect(res.$contentType).toBe('text/html');
    });

    it('should redirect directory w/ slash', async () => {
      await c.fs.writeFiles({
        '/www/about-us/somefile1.html': `somefile1`,
        '/www/about-us/somefile2.html': `somefile2`
      });
      await c.fs.commit();
      config.devServer.historyApiFallback = {};
      const handler = createHttpRequestHandler(config, c);

      req.headers = {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      };
      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/about-us/');
    });

    it('get directory index.html with no trailing slash', async () => {
      await c.fs.writeFiles({
        '/www/about-us/index.html': `aboutus`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/about-us';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('aboutus');
      expect(res.$contentType).toBe('text/html');
    });

    it('get directory index.html with trailing slash', async () => {
      await c.fs.writeFiles({
        '/www/about-us/index.html': `aboutus`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/about-us/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('aboutus');
      expect(res.$contentType).toBe('text/html');
    });

  });

  describe('error not found static files', () => {

    it('not find js file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.js': `alert("hi");`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file2.js';

      await handler(req, res);
      expect(res.$statusCode).toBe(404);
      expect(res.$content).toBe('// File not found: /scripts/file2.js');
      expect(res.$contentType).toBe('application/javascript');
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
      const handler = createHttpRequestHandler(config, c);

      req.url = '/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('tmpl-dir');
      expect(res.$contentType).toBe('text/html');
    });

    it('serve root index.html', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('hello');
      expect(res.$contentType).toBe('text/html');
    });

    it('serve root index.html w/ querystring', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/?qs=123';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('hello');
      expect(res.$contentType).toBe('text/html');
    });

    it('302 redirect to / when no path at all', async () => {
      await c.fs.writeFiles({
        '/www/index.html': `hello`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '';

      await handler(req, res);
      expect(res.$statusCode).toBe(302);
      expect(res.$headers.location).toBe('/');
    });

  });

  describe('serve static text files', () => {

    it('should load file w/ querystring', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.html': `<html></html>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file1.html?qs=1234';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('<html></html>');
      expect(res.$contentType).toBe('text/html');
    });

    it('should load js file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.js': `alert("hi");`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file1.js';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('alert("hi");');
      expect(res.$contentType).toBe('application/javascript');
    });

    it('should load css file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.css': `body{color:red}`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file1.css';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toBe('body{color:red}');
      expect(res.$contentType).toBe('text/css');
    });

    it('should load svg file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.svg': `<svg></svg>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file1.svg';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toBe('<svg></svg>');
      expect(res.$contentType).toBe('image/svg+xml');
    });

    it('should load html file', async () => {
      await c.fs.writeFiles({
        '/www/scripts/file1.html': `<html></html>`
      });
      await c.fs.commit();
      const handler = createHttpRequestHandler(config, c);

      req.url = '/scripts/file1.html';

      await handler(req, res);
      expect(res.$statusCode).toBe(200);
      expect(res.$content).toContain('<html></html>');
      expect(res.$contentType).toBe('text/html');
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
