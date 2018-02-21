import { DevServerConfig } from '../declarations';
import { DEV_SERVER_URL, getClientSideConfig } from './util';


export function injectDevServerScripts(config: DevServerConfig, initialDevServerLoad: boolean) {
  const clientConfig = getClientSideConfig(config);
  clientConfig.initialDevServerLoad = !!initialDevServerLoad;

  return '\n' + [
    `<script data-dev-server-script>`,
    `window.$devServer = ${JSON.stringify(clientConfig, null, 2)};`,
    `</script>`,
    `<script src="${DEV_SERVER_URL}/dev-server.js" data-dev-server-script></script>`
  ].join('\n');
}
