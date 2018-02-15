import { Config } from '../declarations';


export function getContentType(config: Config, filePath: string) {
  const last = filePath.replace(/^.*[/\\]/, '').toLowerCase();
  const ext = last.replace(/^.*\./, '').toLowerCase();

  const hasPath = last.length < filePath.length;
  const hasDot = ext.length < last.length - 1;

  return ((hasDot || !hasPath) && config.devServer.contentTypes[ext]) || 'application/octet-stream';
}
