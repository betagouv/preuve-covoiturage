import fs from 'fs';
import path from 'path';

import { Kernel } from './Kernel';
import { CliTransport } from './transports/CliTransport';
import { HttpTransport } from './transports/HttpTransport';
import { QueueTransport } from './transports/QueueTransport';
import { TransportInterface } from './interfaces';

export function setEnvironment():void {
  process.env.APP_ROOT_PATH = process.cwd();

  if ('npm_package_config_workingDir' in process.env) {
    process.chdir(path.resolve(process.cwd(), process.env.npm_package_config_workingDir));
  }

  process.env.APP_WORKING_PATH = process.cwd();

  // Define config from npm package
  Reflect.ownKeys(process.env)
  .filter((key: string) => /npm_package_config_app/.test(key))
  .forEach((key: string) => {
    const oldKey = key;
    const newKey = key.replace('npm_package_config_', '').toUpperCase();
    if (!(newKey in process.env)) {
      process.env[newKey] = process.env[oldKey];
    }
  });

  process.env.APP_ENV = ('NODE_ENV' in process.env && process.env.NODE_ENV !== undefined) ? process.env.NODE_ENV : 'dev';
}

export function getBootstrapFile():string {
  const basePath = process.cwd();
  const bootstrapFile = ('npm_package_config_bootstrap' in process.env) ? process.env.npm_package_config_bootstrap : './bootstrap.ts';


  const bootstrapPath = path.resolve(basePath, bootstrapFile);

  if (!fs.existsSync(bootstrapPath)) {
    console.error('No bootstrap file provided');
    process.exit(1);
  }
  return bootstrapPath;
}

export async function start(bootstrapPath: string, argv: string[]): Promise<TransportInterface> {
  const [_node, _script, command, ...opts] = argv;

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
  const currentBootstrap = await import(bootstrapPath);
  const kernel = ('kernel' in currentBootstrap) ? currentBootstrap.kernel() : defaultBootstrap.kernel();
  await kernel.boot();
  const serviceProviders = ('serviceProviders' in currentBootstrap) ? currentBootstrap.serviceProviders : defaultBootstrap.serviceProviders;

  for (const serviceProvider of serviceProviders) {
    await kernel.registerServiceProvider(serviceProvider);
  }

  switch (command) {
    case 'http':
      console.log('Starting http interface');
      transport = ('transport' in currentBootstrap && 'http' in currentBootstrap.transport) ?
      currentBootstrap.transport.http(kernel) : defaultBootstrap.transport.http(kernel);
      await transport.up(opts);
      break;
    case 'queue':
      console.log('Starting queue interface');
      transport = ('transport' in currentBootstrap && 'queue' in currentBootstrap.transport) ?
      currentBootstrap.transport.queue(kernel) : defaultBootstrap.transport.queue(kernel);
      await transport.up(opts);
      break;
    default:
      console.log('Starting cli interface');
      transport = ('transport' in currentBootstrap && 'cli' in currentBootstrap.transport) ?
      currentBootstrap.transport.cli(kernel) : defaultBootstrap.transport.cli(kernel);
      await transport.up(argv);
      break;
  }

  return transport;
}

export async function boot(argv: string[]) {
  setEnvironment();
  const bootstrapPath = getBootstrapFile();
  return start(bootstrapPath, argv);
}
