import { process } from '@/deps.ts';
import { bootstrap as app } from './pdc/proxy/bootstrap.ts';

const [, , command, ...opts] = process.argv;

app.boot(command, ...opts).catch((e) => {
  console.error(e.message, e);
  process.exit(1);
});
