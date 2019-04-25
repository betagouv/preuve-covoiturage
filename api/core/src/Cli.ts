#!/usr/bin/env node
import path from 'path';
import { Kernel } from './Kernel';
import { CliTransport } from './transports/CliTransport';
import fs from 'fs';
import { HttpTransport } from './transports/HttpTransport';
import { QueueTransport } from './transports/QueueTransport';

const { argv } = process;
const [_node, _script, command, ...opts] = argv;

const basePath = process.cwd();
const bootstrapFile = process.env.npm_package_config_bootstrap ? process.env.npm_package_config_bootstrap : './bootstrap.ts';
const bootstrapPath = path.resolve(basePath, bootstrapFile);
console.log(Kernel.prototype.providers);
console.log(Reflect.getOwnPropertyDescriptor(Kernel, 'providers'))
console.log(Reflect.get(Kernel, 'providers'))
if (!fs.existsSync(bootstrapPath)) {
  console.error('No bootstrap file provided');
  process.exit(1);
}

function boot() {
  import(bootstrapPath).then(async (bootstrap) => {
    const kernel = ('kernel' in bootstrap) ? bootstrap.kernel : new Kernel();
    await kernel.boot();
    switch (command) {
      case 'http':
        await kernel.up(HttpTransport, opts);
        break;
      case 'queue':
        await kernel.up(QueueTransport, opts);
        break;
      default:
        await kernel.up(CliTransport, opts);
        break;
    }
  });
}

boot();
