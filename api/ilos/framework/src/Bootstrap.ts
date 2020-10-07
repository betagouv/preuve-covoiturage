import fs from 'fs';
import path from 'path';

import {
  kernel,
  BootstrapType,
  TransportInterface,
  KernelInterface,
  NewableType,
  ServiceContainerInterface,
} from '@ilos/common';
import { CliTransport } from '@ilos/cli';
import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';

import { Kernel } from './Kernel';

const defaultBootstrapObject: BootstrapType = {
  kernel: () => Kernel,
  transport: {
    cli: (k) => new CliTransport(k),
    http: (k) => new HttpTransport(k),
    queue: (k) => new QueueTransport(k),
  },
  serviceProviders: [],
};

export class Bootstrap {
  private readonly kernel: () => NewableType<KernelInterface>;
  public serviceProviders: NewableType<ServiceContainerInterface>[];
  private transports: {
    [key: string]: (kernel: KernelInterface) => TransportInterface;
  };

  constructor(currentBootstrapObject: BootstrapType) {
    const bootstrapObject = { ...defaultBootstrapObject, ...currentBootstrapObject };
    this.kernel = bootstrapObject.kernel;
    this.serviceProviders = bootstrapObject.serviceProviders;
    this.transports = bootstrapObject.transport;
  }

  static getWorkingPath(): string {
    const basePath = process.cwd();
    if (!('npm_package_config_workingDir' in process.env)) {
      return basePath;
    }
    return path.resolve(basePath, process.env.npm_package_config_workingDir);
  }

  static setPaths(): void {
    process.env.APP_ROOT_PATH = process.cwd();
    const workingPath = Bootstrap.getWorkingPath();
    if (fs.existsSync(workingPath)) {
      process.chdir(workingPath);
    }
    process.env.APP_WORKING_PATH = process.cwd();
  }

  static setEnv(): void {
    process.env.APP_ENV =
      'NODE_ENV' in process.env && process.env.NODE_ENV !== undefined ? process.env.NODE_ENV : 'dev';
  }

  static setEnvFromPackage(): void {
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
  }

  static getBootstrapFilePath(): string {
    const basePath = Bootstrap.getWorkingPath();
    const bootstrapFile =
      'npm_package_config_bootstrap' in process.env ? process.env.npm_package_config_bootstrap : './bootstrap.js';

    const bootstrapPath = path.resolve(basePath, bootstrapFile);
    if (!fs.existsSync(bootstrapPath)) {
      console.error(`No bootstrap file provided: ${bootstrapPath}`);
      return;
    }
    return bootstrapPath;
  }

  static create(bootstrapObject: BootstrapType): Bootstrap {
    return new Bootstrap(bootstrapObject);
  }

  static async createFromPath(bootstrapPath: string = Bootstrap.getBootstrapFilePath()): Promise<Bootstrap> {
    if (bootstrapPath) {
      const currentBootstrap = await import(bootstrapPath);
      const exportName = path.parse(bootstrapPath).name;
      if (exportName in currentBootstrap) {
        return currentBootstrap[exportName];
      }
    }

    throw new Error(`Unable to load bootstrap file ${bootstrapPath}`);
  }

  async start(
    command: string | ((kernel: KernelInterface) => TransportInterface) | undefined,
    ...opts: any[]
  ): Promise<TransportInterface> {
    let options = [...opts];

    const kernelConstructor = this.kernel();
    let originalServiceProviders = [];

    if (Reflect.hasMetadata(Symbol.for('extension:children'), kernelConstructor)) {
      originalServiceProviders = Reflect.getMetadata(Symbol.for('extension:children'), kernelConstructor);
    }

    const serviceProviders = [...originalServiceProviders, ...this.serviceProviders];

    @kernel({
      children: serviceProviders,
    })
    class CustomKernel extends kernelConstructor {}

    const kernelInstance = new CustomKernel();
    await kernelInstance.bootstrap();

    let transport: TransportInterface;

    if (typeof command === 'function') {
      transport = command(kernelInstance);
    } else if (command !== 'cli' && command in this.transports) {
      transport = this.transports[command](kernelInstance);
    } else {
      transport = this.transports.cli(kernelInstance);
      options = ['', '', !command ? '--help' : command, ...opts];
    }

    this.registerShutdownHook(kernelInstance, transport);

    await transport.up(options);

    return transport;
  }

  protected registerShutdownHook(kernelInstance: KernelInterface, transport: TransportInterface) {
    function handle() {
      setTimeout(() => {
        process.exit(0);
      }, 5000);

      transport
        .down()
        .then(() => {
          kernelInstance
            .shutdown()
            .then(() => {
              process.exit(0);
            })
            .catch(() => {
              process.exit(1);
            });
        })
        .catch(() => {
          process.exit(1);
        });
    }

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
  }

  async boot(command: string | undefined, ...opts: any[]) {
    Bootstrap.setPaths();
    Bootstrap.setEnv();
    Bootstrap.setEnvFromPackage();

    return this.start(command, ...opts);
  }
}
