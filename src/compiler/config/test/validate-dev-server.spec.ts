import { Config } from '../../../declarations';
import { mockLogger, mockStencilSystem } from '../../../testing/mocks';
import { validateBuildConfig } from '../validate-config';
import * as path from 'path';


describe('validateDevServer', () => {

  let config: Config;
  const logger = mockLogger();
  const sys = mockStencilSystem();

  beforeEach(() => {
    config = {
      sys: sys,
      logger: logger,
      rootDir: '/User/some/path/',
      devServer: {
        startDevServer: true,
        contentTypes: {}
      }
    };
  });


  it('should default address', () => {
    validateBuildConfig(config);
    expect(config.devServer.address).toBe('0.0.0.0');
  });

  it('should set address', () => {
    config.devServer.address = '123.123.123.123';
    validateBuildConfig(config);
    expect(config.devServer.address).toBe('123.123.123.123');
  });

  it('should default broadcast', () => {
    validateBuildConfig(config);
    expect(config.devServer.broadcast).toBe(false);
  });

  it('should set broadcast', () => {
    config.devServer.broadcast = true;
    validateBuildConfig(config);
    expect(config.devServer.broadcast).toBe(true);
  });

  it('should default root', () => {
    validateBuildConfig(config);
    expect(config.devServer.root).toBe('/User/some/path/www');
  });

  it('should set relative root', () => {
    config.devServer.root = 'my-rel-root';
    validateBuildConfig(config);
    expect(config.devServer.root).toBe('/User/some/path/my-rel-root');
  });

  it('should set absolute root', () => {
    config.devServer.root = '/User/some/path/my-abs-root';
    validateBuildConfig(config);
    expect(config.devServer.root).toBe('/User/some/path/my-abs-root');
  });

  it('should default gzip', () => {
    validateBuildConfig(config);
    expect(config.devServer.gzip).toBe(true);
  });

  it('should set gzip', () => {
    config.devServer.gzip = false;
    validateBuildConfig(config);
    expect(config.devServer.gzip).toBe(false);
  });

  it('should default port', () => {
    validateBuildConfig(config);
    expect(config.devServer.port).toBe(3333);
  });

  it('should set port', () => {
    config.devServer.port = 4444;
    validateBuildConfig(config);
    expect(config.devServer.port).toBe(4444);
  });

  it('should default historyApiFallback', () => {
    validateBuildConfig(config);
    expect(config.devServer.historyApiFallback).toBeDefined();
    expect(config.devServer.historyApiFallback.index).toBe('index.html');
  });

  it('should set historyApiFallback', () => {
    config.devServer.historyApiFallback = {};
    validateBuildConfig(config);
    expect(config.devServer.historyApiFallback).toBeDefined();
    expect(config.devServer.historyApiFallback.index).toBe('index.html');
  });

  it('should disable historyApiFallback', () => {
    config.devServer.historyApiFallback = null;
    validateBuildConfig(config);
    expect(config.devServer.historyApiFallback).toBe(null);
  });

  it('should default liveReload', () => {
    validateBuildConfig(config);
    expect(config.devServer.liveReload).toBe(true);
  });

  it('should set liveReload', () => {
    config.devServer.liveReload = false;
    validateBuildConfig(config);
    expect(config.devServer.liveReload).toBe(false);
  });

  it('should default openBrowser', () => {
    validateBuildConfig(config);
    expect(config.devServer.openBrowser).toBe(true);
  });

  it('should set openBrowser', () => {
    config.devServer.openBrowser = false;
    validateBuildConfig(config);
    expect(config.devServer.openBrowser).toBe(false);
  });

  it('should default ssl', () => {
    validateBuildConfig(config);
    expect(config.devServer.ssl).toBe(false);
  });

  it('should set ssl', () => {
    config.devServer.ssl = true;
    validateBuildConfig(config);
    expect(config.devServer.ssl).toBe(true);
  });

  it('should default unregisterServiceWorker', () => {
    validateBuildConfig(config);
    expect(config.devServer.unregisterServiceWorker).toBe(true);
  });

  it('should set unregisterServiceWorker', () => {
    config.devServer.unregisterServiceWorker = false;
    validateBuildConfig(config);
    expect(config.devServer.unregisterServiceWorker).toBe(false);
  });

  it('should default protocol http', () => {
    validateBuildConfig(config);
    expect(config.devServer.protocol).toBe('http');
  });

  it('should set protocol https', () => {
    config.devServer.ssl = true;
    validateBuildConfig(config);
    expect(config.devServer.protocol).toBe('https');
  });

});
