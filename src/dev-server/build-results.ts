import { BuildResults, DevServerBuildResults } from '../declarations';


export function generateBuildResults(buildResults: BuildResults) {
  const devServerBuild: DevServerBuildResults = {
    buildId: buildResults.buildId,
    diagnostics: buildResults.diagnostics,
    hasError: buildResults.hasError,
    aborted: buildResults.aborted,
    duration: buildResults.duration,
    isRebuild: buildResults.isRebuild,
    dirsAdded: buildResults.dirsAdded,
    dirsDeleted: buildResults.dirsDeleted,
    filesChanged: buildResults.filesChanged,
    filesWritten: buildResults.filesWritten
  };



  return devServerBuild;
}
