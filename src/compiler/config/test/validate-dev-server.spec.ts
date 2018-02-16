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

  it('should default compress', () => {
    validateBuildConfig(config);
    expect(config.devServer.compress).toBe(true);
  });

  it('should set compress', () => {
    config.devServer.compress = false;
    validateBuildConfig(config);
    expect(config.devServer.compress).toBe(false);
  });

  it('should default httpPort', () => {
    validateBuildConfig(config);
    expect(config.devServer.httpPort).toBe(3333);
  });

  it('should set httpPort', () => {
    config.devServer.httpPort = 4444;
    validateBuildConfig(config);
    expect(config.devServer.httpPort).toBe(4444);
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

  it('should default liveReloadPort', () => {
    validateBuildConfig(config);
    expect(config.devServer.liveReloadPort).toBe(35729);
  });

  it('should set liveReloadPort', () => {
    config.devServer.liveReloadPort = 3210;
    validateBuildConfig(config);
    expect(config.devServer.liveReloadPort).toBe(3210);
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
