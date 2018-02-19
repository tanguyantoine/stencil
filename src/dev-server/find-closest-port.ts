import { DevServerConfig } from '../declarations';
import * as net from 'net';


export async function findOpenPorts(config: DevServerConfig) {
  const ports = await Promise.all([
    findClosestOpenPort(config.address, config.httpPort),
    findClosestOpenPort(config.address, config.liveReloadPort)
  ]);

  config.httpPort = ports[0];
  config.liveReloadPort = ports[1];
}


export async function findClosestOpenPort(host: string, port: number): Promise<number> {
  async function t(portToCheck: number): Promise<number> {
    const isTaken = await isPortTaken(host, portToCheck);
    if (!isTaken) {
      return portToCheck;
    }
    return t(portToCheck + 1);
  }

  return t(port);
}


export function isPortTaken(host: string, port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
    .once('error', () => {
      resolve(true);
    })
    .once('listening', () => {
      tester.once('close', () => {
        resolve(false);
      })
      .close();
    })
    .on('error', (err: any) => {
      reject(err);
    })
    .listen(port, host);
  });
}
