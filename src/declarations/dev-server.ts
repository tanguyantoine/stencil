

export interface DevServerConfig {
  address?: string;
  broadcast?: boolean;
  contentTypes?: { [ext: string]: string };
  contentTypeJsonPath?: string;
  html5mode?: boolean;
  httpPort?: number;
  liveReload?: boolean;
  liveReloadPort?: number;
  open?: boolean;
  protocol?: 'http' | 'https';
  ssl?: boolean;
  start?: boolean;
  staticDir?: string;
  templateDir?: string;
  unregisterServiceWorkers?: boolean;
}
