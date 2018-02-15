

export function injectDevClientHtml(htmlContent: string) {
  return htmlContent + '\n' + DEV_SERVER_SCRIPT;
}

const DEV_SERVER_SCRIPT = `<script src="/__dev-server__/dev-server.js" data-dev-server-script></script>`;
