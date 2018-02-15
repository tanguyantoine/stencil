import { DEV_SERVER_URL } from './serve-static-dev-client';


export function injectDevClientHtml(htmlContent: string) {
  return htmlContent + '\n' + DEV_SERVER_SCRIPT;
}

const DEV_SERVER_SCRIPT = `<script src="/${DEV_SERVER_URL}/dev-server.js" data-dev-server-script></script>`;
