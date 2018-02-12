import { DevServerOptions } from './options';


export function injectDevClientHtml(opts: DevServerOptions, htmlContent: string) {
  const appendString = opts.additionalJsScripts.map(sl => {
    return `<script src="${sl}"></script>`;
  }).join('\n');

  if (htmlContent.includes('</body>')) {
    return htmlContent.replace(
        `</body>`,
        `${appendString}\n</body>`
      );

  } else {
    htmlContent += `\n${appendString}`;
  }

  return htmlContent;
}
