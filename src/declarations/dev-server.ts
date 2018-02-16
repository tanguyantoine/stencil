

export interface DevServerConfig {
  address?: string;
  broadcast?: boolean;
  contentTypes?: { [ext: string]: string };
  html5mode?: boolean;
  httpPort?: number;
  liveReload?: boolean;
  liveReloadPort?: number;
  openBrowser?: boolean;
  protocol?: 'http' | 'https';
  ssl?: boolean;
  startDevServer?: boolean;
  staticDir?: string;
  templateDir?: string;
  template404?: string;
  template500?: string;
  unregisterServiceWorker?: boolean;
}
