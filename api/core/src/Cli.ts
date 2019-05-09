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

const defaultBootstrap = {
  kernel() { return new Kernel(); },
  serviceProviders: [],
  transport: {
    http(k) { return new HttpTransport(k); },
    queue(k) { return new QueueTransport(k); },
    cli(k) { return new CliTransport(k); },
  },
};

let transport;

function boot() {
  import(bootstrapPath).then(async (bootstrap) => {
    const kernel = ('kernel' in bootstrap) ? bootstrap.kernel() : defaultBootstrap.kernel();
    await kernel.boot();
    const serviceProviders = ('serviceProviders' in bootstrap) ? bootstrap.serviceProviders : defaultBootstrap.serviceProviders;

    for (const serviceProvider of serviceProviders) {
      await kernel.registerServiceProvider(serviceProvider);
    }

    switch (command) {
      case 'http':
        transport = ('transport' in bootstrap && 'http' in bootstrap.transport) ? bootstrap.transport.http(kernel) : defaultBootstrap.transport.http(kernel);
        await transport.up(opts);
        break;
      case 'queue':
      transport = ('transport' in bootstrap && 'queue' in bootstrap.transport) ? bootstrap.transport.queue(kernel) : defaultBootstrap.transport.queue(kernel);
        await transport.up(opts);
        break;
      default:
        transport = ('transport' in bootstrap && 'cli' in bootstrap.transport) ? bootstrap.transport.cli(kernel) : defaultBootstrap.transport.cli(kernel);
        await transport.up(argv);
        break;
    }
  });
}

boot();
