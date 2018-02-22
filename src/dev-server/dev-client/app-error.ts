import * as d from '../../declarations';


export function appError(doc: Document, buildResults: d.DevServerBuildResults) {
  if (!Array.isArray(buildResults.diagnostics)) {
    return;
  }

  const container = getErrorContainer(doc);

  buildResults.diagnostics.forEach(diagnostic => {
    consoleLogError(diagnostic);
    errorDiagnostic(doc, container, diagnostic);
  });
}


function errorDiagnostic(doc: Document, container: HTMLElement, diagnostic: d.Diagnostic) {
  const cardOuter = doc.createElement('div');
  cardOuter.className = 'dev-server-app-error-card';

  const cardInner = doc.createElement('div');
  cardInner.className = 'dev-server-app-error-card-inner';
  cardOuter.appendChild(cardInner);

  const message = doc.createElement('div');
  message.className = 'dev-server-app-error-card-message';
  message.textContent = diagnostic.messageText;
  cardInner.appendChild(message);

  container.appendChild(cardOuter);
}


function getErrorContainer(doc: Document) {
  let outer = doc.getElementById('dev-server-app-error');
  if (!outer) {
    outer = doc.createElement('div');
    outer.id = 'dev-server-app-error';
    doc.body.appendChild(outer);
  }

  outer.innerHTML = `
    <style>#dev-server-app-error { display: none; }</style>
    <link href="/__dev-server/dev-server-app-error.css" rel="stylesheet">
    <div id="dev-server-error-inner"></div>
  `;

  return doc.getElementById('dev-server-app-error-inner');
}


function consoleLogError(diagnostic: d.Diagnostic) {
  const msg: string[] = [];

  if (diagnostic.header) {
    msg.push(diagnostic.header);
  }

  if (diagnostic.messageText) {
    msg.push(diagnostic.messageText);
  }

  if (msg.length > 0) {
    console.error(msg.join('\n'));
  }
}


export function clearAppError(doc: Document) {
  const appErrorElm = doc.getElementById('dev-server-app-error');
  if (appErrorElm) {
    appErrorElm.parentNode.removeChild(appErrorElm);
  }
}
