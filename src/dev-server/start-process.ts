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

    const child = fork(program, parameters, options);

    child.stdout.on('data', (data: any) => {
      config.logger.debug(`dev server: ${data}`);
    });

    child.stderr.on('data', (data: any) => {
      config.logger.error(`dev server error: ${data}`);
      child.kill();
    });

    child.on('message', (msg: DevServerMessage) => {
      receiveMsgFromChild(config, msg);

      if (msg.startServerResponse) {
        resolve(msg.startServerResponse);
      }
    });

    // listen for build finish
    compilerCtx.events.subscribe('build', (buildResults) => {
      const msg: DevServerMessage = {
        buildResults: generateBuildResults(buildResults)
      };
      child.send(msg);
    });

    // start the server
    const msg: DevServerMessage = {
      startServerRequest: config.devServer
    };
    child.send(msg);
  });
}


function receiveMsgFromChild(config: Config, msg: DevServerMessage) {
  if (msg.startServerResponse) {
    config.devServer.ssl = msg.startServerResponse.ssl;
    config.devServer.address = msg.startServerResponse.address;
    config.devServer.port = msg.startServerResponse.port;
    config.devServer.browserUrl = msg.startServerResponse.browserUrl;

    if (config.devServer.openBrowser) {
      config.sys.open(msg.startServerResponse.openUrl);
    }
  }
}

