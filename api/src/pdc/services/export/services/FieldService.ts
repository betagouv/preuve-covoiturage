import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { FieldFilter, Fields } from "../models/CSVWriter.ts";
import { ExportTarget } from "../models/Export.ts";

export abstract class FieldServiceInterfaceResolver {
  public byTarget(type: ExportTarget): Partial<Fields> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: FieldServiceInterfaceResolver,
})
export class FieldService {
  constructor(protected config: ConfigInterfaceResolver) {}

  public byTarget(target: ExportTarget): Partial<Fields> {
    const fields = this.config.get("export.fields", []) as Fields;
    const filter = this.config.get<FieldFilter[]>("export.filters", [])
      .find((filter: FieldFilter) => filter.target === target);

    if (!filter) {
      logger.warn(`No filter found for target ${target}`);
      return fields;
    }

    return fields.filter((field) => !filter.exclusions.includes(field));
  }
}
