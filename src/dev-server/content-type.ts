import { DevServerOptions } from './options';


export function getContentType(opts: DevServerOptions, filePath: string) {
  const last = filePath.replace(/^.*[/\\]/, '').toLowerCase();
  const ext = last.replace(/^.*\./, '').toLowerCase();

  const hasPath = last.length < filePath.length;
  const hasDot = ext.length < last.length - 1;

  return ((hasDot || !hasPath) && opts.contentType[ext]) || 'application/octet-stream';
}
