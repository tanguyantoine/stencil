import { CompilerCtx, Config, DevServerMessage } from '../declarations';

/**
 * NODE ONLY!
 * NOTE! this method is still apart of the main bundle
 * it is not apart of the dev-server/index.js bundle
 */

export function forkDevServerProcess(config: Config, compilerCtx: CompilerCtx) {
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
    config.logger.error(`dev server: ${data}`);
  });

  child.on('message', (msg: DevServerMessage) => {
    receiveMsgFromChild(config, msg);
  });

  // listen for build finish
  compilerCtx.events.subscribe('build', (buildResults) => {
    const msg: DevServerMessage = {
      buildFinish: {
        results: buildResults
      }
    };
    child.send(msg);
  });

  // start the server
  const msg: DevServerMessage = {
    startServerRequest: config.devServer
  };
  child.send(msg);
}


function receiveMsgFromChild(config: Config, msg: DevServerMessage) {
  if (msg.startServerResponse) {
    config.devServer.protocol = msg.startServerResponse.protocol;
    config.devServer.address = msg.startServerResponse.address;
    config.devServer.httpPort = msg.startServerResponse.httpPort;
    config.devServer.browserUrl = msg.startServerResponse.browserUrl;

    if (config.devServer.openBrowser) {
      config.sys.open(msg.startServerResponse.openUrl);
    }
  }
}

