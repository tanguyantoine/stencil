import { getAddressForBrowser } from './utils';
import { getSSL } from './ssl';
import * as path from 'path';


export async function createLiveReload(port: number, address: string, wwwDir: string , ssl: boolean): Promise<[ tinylr.server, string, (changedFile: string[]) => void]> {

  const options: any = ssl ? await getSSL() : {};
  const protocol = ssl ? 'https' : 'http';

  const liveReloadServer = tinylr(options);
  liveReloadServer.listen(port, address);

  return [
    liveReloadServer,
    `${protocol}://${getAddressForBrowser(address)}:${port}/livereload.js?snipver=1`,
    (changedFiles: string[]) => {
      liveReloadServer.changed({
        body: {
          files: changedFiles.map(changedFile => (
            '/' + path.relative(wwwDir, changedFile)
          ))
        }
      });
    }
  ];
}
