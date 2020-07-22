import bull, { Queue } from 'bull';

export function bullFactory(name: string, redisConnection: any, opts: object = {}): Queue {
  return new bull(name, {
    ...opts,
    createClient: () => redisConnection,
  });
}
