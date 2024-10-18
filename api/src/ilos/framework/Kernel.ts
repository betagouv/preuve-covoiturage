import { CommandExtension } from "@/ilos/cli/index.ts";
import { kernel } from "@/ilos/common/index.ts";
import { Extensions, Kernel as BaseKernel } from "@/ilos/core/index.ts";
import { QueueExtension } from "@/ilos/queue/index.ts";
import { ValidatorExtension } from "@/ilos/validator/index.ts";
import { cwd } from "@/lib/process/index.ts";

@kernel({
  config: cwd(),
})
export class Kernel extends BaseKernel {
  readonly extensions = [
    Extensions.Config,
    CommandExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
    QueueExtension,
  ];
}
