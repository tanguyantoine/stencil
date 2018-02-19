import * as d from './index';


export interface DevServerConfig {
  address?: string;
  broadcast?: boolean;
  browserUrl?: string;
  contentTypes?: { [ext: string]: string };
  devServerDir?: string;
  gzip?: boolean;
  historyApiFallback?: HistoryApiFallback;
  httpPort?: number;
  liveReload?: boolean;
  liveReloadPort?: number;
  openBrowser?: boolean;
  protocol?: 'http' | 'https';
  root?: string;
  ssl?: boolean;
  startDevServer?: boolean;
  unregisterServiceWorker?: boolean;
}


export interface HistoryApiFallback {
  index?: string;
  disableDotRule?: boolean;
}


export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  acceptHeader: string;
  url: string;
  pathname?: string;
  filePath?: string;
  stats?: d.FsStats;
}


export interface DevServerMessage {
  startServerRequest?: DevServerConfig;
  startServerResponse?: {
    protocol: 'http' | 'https',
    address: string,
    httpPort: number,
    browserUrl: string,
    openUrl: string
  };
  buildFinish?: {
    results: d.BuildResults
  };
}
