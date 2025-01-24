import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { DataGouvAPIConfig } from "@/pdc/services/export/config/datagouv.ts";

@provider()
export class DataGouvMetadataProvider {
  protected config: DataGouvAPIConfig;

  constructor(configStore: ConfigInterfaceResolver) {
    this.config = configStore.get("datagouv.api");
  }

  description(): string {
    return new Date().toISOString();
  }
}
