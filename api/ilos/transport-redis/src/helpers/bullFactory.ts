import bull, { Queue } from 'bull';

export function bullFactory(name: string, url?: string, opts?: object): Queue {
  return new bull(name, url, opts);
}
