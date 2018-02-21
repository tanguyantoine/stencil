import * as d from './index';


export interface DevServerConfig {
  address?: string;
  broadcast?: boolean;
  contentTypes?: { [ext: string]: string };
  devServerDir?: string;
  gzip?: boolean;
  historyApiFallback?: HistoryApiFallback;
  port?: number;
  liveReload?: boolean;
  openBrowser?: boolean;
  root?: string;
  ssl?: boolean;
  startDevServer?: boolean;
  browserUrl?: string;
  openUrl?: string;
}


export interface DevServerClientConfig {
  browserUrl: string;
  openUrl: string;
  hasClientInitialized?: boolean;
  initialDevServerLoad?: boolean;
  ssl: boolean;
  address: string;
  port: number;
  liveReload: boolean;
}


export interface DevClientWindow extends Window {
  $devServer: DevServerClientConfig;
  MozWebSocket: new (socketUrl: string, protos: string[]) => DevClientSocket;
  WebSocket: new (socketUrl: string, protos: string[]) => DevClientSocket;
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


export interface DevClientSocket {
  onopen: () => void;
  onerror: (event: { message: string; }) => void;
  onmessage: (event: { data: DevServerMessage; }) => void;
  onclose: (event: { code: number; reason: string; }) => void;
  protocol: number;
  send: (msg: string) => void;
}


export interface DevServerSocketConstructor {
  isWebSocket: (req: any) => boolean;
  new (request: any, socket: any, body: any, protos: string[]): DevServerSocket;
}


export interface DevServerSocket {
  on: (type: string, cb: (event: { data: DevServerMessage; }) => void) => void;
  send: (msg: string) => void;
}


export interface DevServerMessage {
  startServerRequest?: DevServerConfig;
  startServerResponse?: DevServerClientConfig;
  buildFinish?: {
    results: d.BuildResults
  };
}
