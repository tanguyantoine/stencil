import { DevServerClientConfig, DevServerConfig, HttpRequest } from '../declarations';


export function getClientSideConfig(config: DevServerConfig) {
  const browserUrl = getBrowserUrl(config);
  const openUrl = browserUrl + UNREGISTER_SW_URL;

  const clientConfig: DevServerClientConfig = {
    ssl: config.ssl,
    address: config.address,
    port: config.port,
    browserUrl: browserUrl,
    openUrl: openUrl,
    liveReload: config.liveReload
  };

  return clientConfig;
}

export function getBrowserUrl(config: DevServerConfig) {
  const address = (config.address === '0.0.0.0') ? 'localhost' : config.address;
  const port = (config.port === 80 || config.port === 443) ? '' : (':' + config.port);
  return `${config.ssl ? 'https' : 'http'}://${address}${port}`;
}

export function getContentType(devServer: DevServerConfig, filePath: string) {
  const last = filePath.replace(/^.*[/\\]/, '').toLowerCase();
  const ext = last.replace(/^.*\./, '').toLowerCase();

  const hasPath = last.length < filePath.length;
  const hasDot = ext.length < last.length - 1;

  return ((hasDot || !hasPath) && devServer.contentTypes[ext]) || 'application/octet-stream';
}

export function isHtmlFile(filePath: string) {
  filePath = filePath.toLowerCase().trim();
  return (filePath.endsWith('.html') || filePath.endsWith('.htm'));
}

export function isStaticDevClient(req: HttpRequest) {
  return req.pathname.startsWith(DEV_SERVER_URL);
}

export function isDevServerInitialLoad(req: HttpRequest) {
  return req.pathname === UNREGISTER_SW_URL;
}

export const DEV_SERVER_URL = '/__dev-server';

export const UNREGISTER_SW_URL = `${DEV_SERVER_URL}-init`;
