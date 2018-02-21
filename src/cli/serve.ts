import { Config, DevServerClientConfig } from '../declarations';


export async function startDevServer(config: Config, compiler: any) {
  config.devServer = config.devServer || {};
  config.devServer.startDevServer = true;

  if (typeof config.devServer.openBrowser !== 'boolean') {
    config.devServer.openBrowser = false;
  }

  const clientConfig: DevServerClientConfig = await compiler.startDevServer();
  config.logger.info(`dev server: ${clientConfig.browserUrl}`);

  process.once('SIGINT', () => {
    process.exit(0);
  });
}
