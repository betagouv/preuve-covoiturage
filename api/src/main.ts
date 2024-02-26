import 'module-alias/register';
import { bootstrap as app } from './pdc/proxy/bootstrap';

const [, , command, ...opts] = process.argv;

app.boot(command, ...opts).catch((e) => {
  console.error(e.message, e);
  process.exit(1);
});
