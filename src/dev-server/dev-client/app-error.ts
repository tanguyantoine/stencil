import * as d from '../../declarations';


export function appError(_doc: Document, buildResults: d.DevServerBuildResults) {
  console.log('appError', buildResults.diagnostics);
}
