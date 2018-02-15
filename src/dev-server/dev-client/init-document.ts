

export function initDocument(document: HTMLDocument) {
  removeDevServerScripts(document);


}


function removeDevServerScripts(document: HTMLDocument) {
  const devScripts = document.querySelectorAll('script[data-dev-server-script]');

  for (let i = 0; i < devScripts.length; i++) {
    devScripts[i].parentNode.removeChild(devScripts[i]);
  }
}
