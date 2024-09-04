import { Bootstrap as BaseBootstrap } from "@/ilos/framework/index.ts";
import { TransportInterface } from "@/ilos/common/index.ts";
import { CliTransport } from "@/ilos/cli/index.ts";

import { Kernel } from "./Kernel.ts";
import { HttpTransport } from "./HttpTransport.ts";
import { MyQueueTransport } from "./QueueTransport.ts";

export const bootstrap = BaseBootstrap.create({
  kernel: (): any => Kernel,
  transport: {
    http: (k): TransportInterface => new HttpTransport(k),
    queue: (k): TransportInterface => new MyQueueTransport(k),
    cli: (k): TransportInterface => new CliTransport(k),
  },
});
