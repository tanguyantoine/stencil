

export interface DevServerConfig {
  address?: string;
  broadcast?: boolean;
  compress?: boolean;
  contentTypes?: { [ext: string]: string };
  historyApiFallback?: HistoryApiFallback;
  httpPort?: number;
  liveReload?: boolean;
  liveReloadPort?: number;
  openBrowser?: boolean;
  protocol?: 'http' | 'https';
  ssl?: boolean;
  startDevServer?: boolean;
  staticDir?: string;
  templateDir?: string;
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
}
