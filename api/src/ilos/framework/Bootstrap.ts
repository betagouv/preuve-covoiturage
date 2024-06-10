import { fs, isMainThread, path, pino, process } from "@/deps.ts";
import { CliTransport } from "@/ilos/cli/index.ts";
import {
  BootstrapType,
  kernel,
  KernelInterface,
  NewableType,
  ServiceContainerInterface,
  TransportInterface,
} from "@/ilos/common/index.ts";
import {
  catchErrors,
  interceptConsole,
  registerGracefulShutdown,
} from "@/ilos/tools/index.ts";
import { HttpTransport } from "@/ilos/transport-http/index.ts";
import { QueueTransport } from "@/ilos/transport-redis/index.ts";
import { Kernel } from "./Kernel.ts";

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
    const bootstrapObject = {
      ...defaultBootstrapObject,
      ...currentBootstrapObject,
    };
    if (!bootstrapObject.kernel) {
      throw new Error("Kernel is required");
    }

    if (!bootstrapObject.transport) {
      throw new Error("Transport is required");
    }

    this.kernel = bootstrapObject.kernel;
    this.serviceProviders = bootstrapObject.serviceProviders || [];
    this.transports = bootstrapObject.transport;
  }

  static getWorkingPath(): string {
    return process.cwd();
  }

  static setPaths(): void {
    process.env.APP_ROOT_PATH = process.cwd();
    const workingPath = Bootstrap.getWorkingPath();
    // process.chdir is unavailable on child thread
    if (
      fs.existsSync(workingPath) && workingPath !== process.cwd() &&
      isMainThread
    ) {
      process.chdir(workingPath);
    }
    process.env.APP_WORKING_PATH = process.cwd();
  }

  static setEnv(): void {
    process.env.APP_ENV =
      "NODE_ENV" in process.env && process.env.NODE_ENV !== undefined
        ? process.env.NODE_ENV
        : "local";
  }

  static setEnvFromPackage(): void {
    // Define config from npm package
    Reflect.ownKeys(process.env)
      .filter((key) => /npm_package_config_app/.test(String(key)))
      .forEach((key) => {
        const oldKey = String(key);
        const newKey = String(key).replace("npm_package_config_", "")
          .toUpperCase(); // FIXME
        if (!(newKey in process.env)) {
          process.env[newKey] = process.env[oldKey];
        }
      });
  }

  /**
   * Setting log_level for pino
   * https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter
   *
   * Level: 	trace 	debug 	info 	warn 	error 	fatal 	silent
   * Value: 	10 	    20 	    30 	  40 	  50 	    60 	    Infinity
   */
  static interceptConsole(): void {
    const logger = pino.default({
      level: process.env.APP_LOG_LEVEL ??
        (process.env.NODE_ENV !== "production" ? "debug" : "error"),
    });

    interceptConsole(logger);
  }

  static getBootstrapFilePath(): string {
    const basePath = Bootstrap.getWorkingPath();
    const bootstrapFile = "./bootstrap.js";
    const bootstrapPath = path.resolve(basePath, bootstrapFile);

    if (!fs.existsSync(bootstrapPath)) {
      throw new Error(`No bootstrap file provided: ${bootstrapPath}`);
    }

    return bootstrapPath;
  }

  static create(bootstrapObject: BootstrapType): Bootstrap {
    return new Bootstrap(bootstrapObject);
  }

  static async createFromPath(
    bootstrapPath: string = Bootstrap.getBootstrapFilePath(),
  ): Promise<Bootstrap> {
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
    command:
      | string
      | ((kernel: KernelInterface) => TransportInterface)
      | undefined,
    ...opts: any[]
  ): Promise<TransportInterface> {
    let options = [...opts];

    const kernelConstructor = this.kernel();
    let originalServiceProviders = [];

    if (
      Reflect.hasMetadata(Symbol.for("extension:children"), kernelConstructor)
    ) {
      originalServiceProviders = Reflect.getMetadata(
        Symbol.for("extension:children"),
        kernelConstructor,
      );
    }

    const serviceProviders = [
      ...originalServiceProviders,
      ...this.serviceProviders,
    ];

    @kernel({
      children: serviceProviders,
    })
    class CustomKernel extends kernelConstructor {}

    console.debug("Kernel: starting");
    const kernelInstance = new CustomKernel();
    await kernelInstance.bootstrap();
    console.debug("Kernel: started");

    let transport: TransportInterface;

    if (typeof command === "function") {
      transport = command(kernelInstance);
    } else if (
      command !== "cli" && typeof command !== "undefined" &&
      command in this.transports
    ) {
      transport = this.transports[command](kernelInstance);
    } else {
      transport = this.transports.cli(kernelInstance);
      options = ["", "", !command ? "--help" : command, ...opts];
    }

    this.registerShutdownHook(kernelInstance, transport);

    console.debug("Transport: starting");
    await transport.up(options);
    console.debug("Transport: started");

    return transport;
  }

  protected registerShutdownHook(
    kernelInstance: KernelInterface,
    transport: TransportInterface,
  ) {
    catchErrors([
      async () => transport.down(),
      async () => kernelInstance.shutdown(),
    ]);
    registerGracefulShutdown([
      async () => transport.down(),
      async () => kernelInstance.shutdown(),
    ]);
  }

  async boot(command: string | undefined, ...opts: any[]) {
    Bootstrap.interceptConsole();
    console.info("Bootstraping app...");

    Bootstrap.setPaths();
    Bootstrap.setEnv();
    Bootstrap.setEnvFromPackage();

    return this.start(command, ...opts);
  }
}
