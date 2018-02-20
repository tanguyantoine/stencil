import { DevServerConfig, DevServerMessage } from '../declarations';
import { NodeFs } from '../sys/node/node-fs';
import { startDevServer } from './start-server';
import * as path from 'path';


// fork-dev-server-process.ts file actually kicks off
// this file from the main process

process.on('message', async (msg: DevServerMessage) => {
  if (msg.startServerRequest) {
    startServerRequest(msg.startServerRequest);
  }
});


async function startServerRequest(config: DevServerConfig) {
  try {
    const fs = new NodeFs();
    config.contentTypes = await loadContentTypes(fs);
    startDevServer(config, fs);

  } catch (e) {
    console.error('dev server error', e);
  }
}


async function loadContentTypes(fs: NodeFs) {
  const contentTypePath = path.join(__dirname, 'content-type-db.json');
  const contentTypeJson = await fs.readFile(contentTypePath);
  return JSON.parse(contentTypeJson);
}
