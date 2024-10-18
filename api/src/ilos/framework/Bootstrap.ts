import { CliTransport } from "@/ilos/cli/index.ts";
import {
  BootstrapType,
  kernel,
  KernelInterface,
  NewableType,
  ServiceContainerInterface,
  TransportInterface,
} from "@/ilos/common/index.ts";
import { QueueTransport } from "@/ilos/transport-redis/index.ts";
import { getTmpDir } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { catchErrors, registerGracefulShutdown } from "@/lib/process/index.ts";
import { Kernel } from "./Kernel.ts";

const defaultBootstrapObject: BootstrapType = {
  kernel: () => Kernel,
  transport: {
    cli: (k) => new CliTransport(k),
    queue: (k) => new QueueTransport(k),
  },
  serviceProviders: [],
};

export class Bootstrap {
  public readonly kernel: () => NewableType<KernelInterface>;
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

    logger.debug("Kernel: starting");
    const kernelInstance = new CustomKernel();
    await kernelInstance.bootstrap();
    logger.debug("Kernel: started");

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

    logger.debug("Transport: starting");
    await transport.up(options);
    logger.debug("Transport: started");

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
    logger.info("Bootstraping app...");

    const tmpdir = getTmpDir();
    logger.info(`Using temporary directory: ${tmpdir}`);

    return await this.start(command, ...opts);
  }
}
