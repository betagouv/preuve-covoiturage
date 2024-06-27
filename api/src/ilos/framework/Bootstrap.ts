import { pino, process } from "@/deps.ts";
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

  static setEnv(): void {
    process.env.APP_ENV =
      "NODE_ENV" in process.env && process.env.NODE_ENV !== undefined
        ? process.env.NODE_ENV
        : "local";
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

  static create(bootstrapObject: BootstrapType): Bootstrap {
    return new Bootstrap(bootstrapObject);
  }

  async start(
    command:
      | string
      | ((kernel: KernelInterface) => TransportInterface)
      | undefined,
    ...opts: any[]
  ): Promise<TransportInterface> {
    let shouldBeKilled = false;
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
      shouldBeKilled = true;
    }

    this.registerShutdownHook(kernelInstance, transport);

    console.debug("Transport: starting");
    await transport.up(options);
    console.debug("Transport: started");

    if (shouldBeKilled) {
      await transport.down();
      await kernelInstance.shutdown();
    }

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

  async boot(
    command: string | undefined,
    ...opts: any[]
  ): Promise<TransportInterface> {
    Bootstrap.interceptConsole();
    console.info("Bootstraping app...");

    Bootstrap.setEnv();

    return await this.start(command, ...opts);
  }
}
