import {
  command,
  CommandInterface,
  CommandOptionType,
  KernelInterfaceResolver,
} from "@/ilos/common/index.ts";
import {
  ParamsInterface as BuildExportParamInterface,
  ResultInterface as BuildExportResultInterface,
  signature as buildExportSignature,
} from "@/shared/trip/buildExport.contract.ts";

export interface StartEndDate {
  start: Date;
  end: Date;
}

@command()
export class PublishOpendataCommand implements CommandInterface {
  static readonly signature: string = "trip:publish";
  static readonly description: string = "Publish opendata file for last month";
  static readonly options: CommandOptionType[] = [];

  constructor(private kernel: KernelInterfaceResolver) {}

  public async call(): Promise<void> {
    const params: BuildExportParamInterface = {
      type: "opendata",
      format: {
        tz: "Europe/Paris",
      },
    };
    const context = {
      channel: { service: "trip" },
    };
    await this.kernel.call<
      BuildExportParamInterface,
      BuildExportResultInterface
    >(
      buildExportSignature,
      params,
      context,
    );
  }
}
