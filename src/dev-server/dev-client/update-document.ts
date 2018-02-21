import { DevServerBuildResults, DevServerClientConfig } from '../../declarations';


export function updateDocument(devServer: DevServerClientConfig, doc: Document, buildResults: DevServerBuildResults) {
  try {
    console.log('updateApp');

    initDocument(devServer, doc, buildResults);

  } catch (e) {
    console.error(e);
  }
}


function initDocument(devServer: DevServerClientConfig, doc: Document, buildResults: DevServerBuildResults) {
  if (devServer.hasDocumentInitialized) {
    return;
  }

  if (buildResults.hasError) {
    return;
  }

  if (typeof buildResults.indexHtml !== 'string') {
    return;
  }

  console.log('initDocument', buildResults);

  const parser = new DOMParser();
  const appDoc = parser.parseFromString(buildResults.indexHtml, 'text/html');

  doc.head.innerHTML = '';

  for (let i = 0; i < appDoc.head.childNodes.length; i++) {
    doc.head.appendChild(appDoc.head.childNodes[i].cloneNode(true));
  }

  doc.body.innerHTML = '';

  for (let i = 0; i < appDoc.body.childNodes.length; i++) {
    doc.body.appendChild(appDoc.body.childNodes[i].cloneNode(true));
  }

  devServer.hasDocumentInitialized = true;
}
