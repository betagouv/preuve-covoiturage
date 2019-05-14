import { boot } from './bootstrap';

if (process.env.NODE_ENV !== 'testing') {
  console.log('Bootstraping app...');
  boot(process.argv);
}
