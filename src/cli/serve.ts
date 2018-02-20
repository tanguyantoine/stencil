import { Config, DevServerInfo } from '../declarations';


export async function startDevServer(config: Config, compiler: any) {
  config.devServer = config.devServer || {};
  config.devServer.startDevServer = true;

  if (typeof config.devServer.openBrowser !== 'boolean') {
    config.devServer.openBrowser = false;
  }

  const devInfo: DevServerInfo = await compiler.startDevServer();
  config.logger.info(`dev server: ${devInfo.browserUrl}`);

  process.once('SIGINT', () => {
    process.exit(0);
  });
}
