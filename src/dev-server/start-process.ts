import { CompilerCtx, Config, DevServerClientConfig, DevServerMessage } from '../declarations';
import { generateBuildResults } from './build-results';


/**
 * NODE ONLY!
 * NOTE! this method is still apart of the main bundle
 * it is not apart of the dev-server/index.js bundle
 */

export function startDevServerProcess(config: Config, compilerCtx: CompilerCtx): Promise<DevServerClientConfig> {
  return new Promise(resolve => {
    const path = require('path');
    const fork = require('child_process').fork;

    // using the path stuff below because after the the bundles are created
    // then these files are no longer relative to how they are in the src directory
    config.devServer.devServerDir = path.join(__dirname, '../dev-server');

    const program = require.resolve(path.join(config.devServer.devServerDir, 'index.js'));

    const parameters: string[] = [];
    const options = {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    };

    const serverProcess = fork(program, parameters, options);

    serverProcess.stdout.on('data', (data: any) => {
      config.logger.debug(`dev server: ${data}`);
    });

    serverProcess.stderr.on('data', (data: any) => {
      config.logger.error(`dev server error: ${data}`);
      serverProcess.kill();
    });

    serverProcess.on('message', (msg: DevServerMessage) => {
      cliReceivedMessageFromServer(config, compilerCtx, serverProcess, msg, resolve);
    });

    // listen for build finish
    compilerCtx.events.subscribe('build', async (buildResults) => {
      const msg: DevServerMessage = {
        buildResults: await generateBuildResults(config, compilerCtx, buildResults)
      };
      serverProcess.send(msg);
    });

    // start the server
    const msg: DevServerMessage = {
      startServerRequest: config.devServer
    };
    serverProcess.send(msg);
  });
}


async function cliReceivedMessageFromServer(config: Config, compilerCtx: CompilerCtx, serverProcess: any, msg: DevServerMessage, resolve: Function) {
  if (msg.startServerResponse) {
    // the server has successfully started
    config.devServer.ssl = msg.startServerResponse.ssl;
    config.devServer.address = msg.startServerResponse.address;
    config.devServer.port = msg.startServerResponse.port;
    config.devServer.browserUrl = msg.startServerResponse.browserUrl;

    if (config.devServer.openBrowser) {
      config.sys.open(msg.startServerResponse.openUrl);
    }
    resolve(msg.startServerResponse);
    return;
  }

  if (msg.requestBuildResults) {
    // the browser wants the latest results sent
    if (compilerCtx.lastBuildResults) {
      const msg: DevServerMessage = {
        buildResults: await generateBuildResults(config, compilerCtx, compilerCtx.lastBuildResults)
      };
      serverProcess.send(msg);
    }
    return;
  }
}

