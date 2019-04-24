#!/usr/bin/env node
import path from 'path';
import { Kernel } from './Kernel';
import { CliTransport } from './transports/CliTransport';
import fs from 'fs';

const basePath = process.cwd();
const bootstrapFile = process.env.npm_package_config_bootstrap ? process.env.npm_package_config_bootstrap : './bootstrap.ts';
const bootstrapPath = path.resolve(basePath, bootstrapFile);

if (!fs.existsSync(bootstrapPath)) {
  console.error('No bootstrap file provided');
  process.exit(1);
}

function boot() {
  import(bootstrapPath).then(async (bootstrap) => {
    const kernel = ('kernel' in bootstrap) ? bootstrap.kernel : new Kernel();
    await kernel.boot();
    kernel.up(CliTransport);
  });
}

boot();
