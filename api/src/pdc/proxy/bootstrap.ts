import { CliTransport } from "@/ilos/cli/index.ts";
import { TransportInterface } from "@/ilos/common/index.ts";
import { Bootstrap as BaseBootstrap } from "@/ilos/framework/index.ts";

import { HttpTransport } from "./HttpTransport.ts";
import { Kernel } from "./Kernel.ts";

export const bootstrap = BaseBootstrap.create({
  kernel: (): any => Kernel,
  transport: {
    http: (k): TransportInterface => new HttpTransport(k),
    cli: (k): TransportInterface => new CliTransport(k),
  },
});
