#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { Kernel } from './Kernel';
import { CliTransport } from './transports/CliTransport';
import { HttpTransport } from './transports/HttpTransport';
import { QueueTransport } from './transports/QueueTransport';

const { argv } = process;
const [_node, _script, command, ...opts] = argv;

const basePath = process.cwd();
const bootstrapFile = process.env.npm_package_config_bootstrap ? process.env.npm_package_config_bootstrap : './bootstrap.ts';
const bootstrapPath = path.resolve(basePath, bootstrapFile);

if (!fs.existsSync(bootstrapPath)) {
  console.error('No bootstrap file provided');
  process.exit(1);
}


let transport;

function boot() {
  import(bootstrapPath).then(async (bootstrap) => {
    const kernel = ('kernel' in bootstrap) ? bootstrap.kernel : new Kernel();
    await kernel.boot();
    const serviceProviders = ('serviceProviders' in bootstrap) ? bootstrap.serviceProviders : [];
    for (const serviceProvider of serviceProviders) {
      await kernel.registerServiceProvider(serviceProvider);
    }
    switch (command) {
      case 'http':
        transport = new HttpTransport(kernel);
        await transport.up(opts);
        break;
      case 'queue':
        transport = new QueueTransport(kernel);
        await transport.up(opts);
        break;
      default:
        transport = new CliTransport(kernel);
        await transport.up(argv);
        break;
    }
  });
}

boot();
