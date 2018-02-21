import { BuildResults, CompilerCtx, Config, DevServerBuildResults } from '../declarations';


export async function generateBuildResults(config: Config, compilerCtx: CompilerCtx, buildResults: BuildResults) {
  const devServerBuild: DevServerBuildResults = {
    buildId: buildResults.buildId,
    diagnostics: buildResults.diagnostics,
    hasError: buildResults.hasError,
    hasSuccessfulBuild: buildResults.hasSuccessfulBuild,
    aborted: buildResults.aborted,
    duration: buildResults.duration,
    isRebuild: buildResults.isRebuild,
    dirsAdded: buildResults.dirsAdded,
    dirsDeleted: buildResults.dirsDeleted,
    filesChanged: buildResults.filesChanged,
    filesWritten: buildResults.filesWritten
  };

  devServerBuild.indexHtml = await compilerCtx.fs.readFile(config.wwwIndexHtml);

  return devServerBuild;
}
