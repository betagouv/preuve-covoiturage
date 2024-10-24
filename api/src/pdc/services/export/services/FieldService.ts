import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { FieldFilter, Fields } from "../models/CSVWriter.ts";
import { ExportTarget } from "../models/Export.ts";

export abstract class FieldServiceInterfaceResolver {
  public byTarget<T extends { [k: string]: unknown }>(type: ExportTarget): Partial<Fields<T>> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: FieldServiceInterfaceResolver,
})
export class FieldService {
  constructor(protected config: ConfigInterfaceResolver) {}

  public byTarget<T extends { [k: string]: unknown }>(target: ExportTarget): Partial<Fields<T>> {
    const source = target === ExportTarget.OPENDATA ? "datagouv" : "export";
    const fields = this.config.get(`${source}.fields`, []) as Fields<T>;
    const filter = this.config.get<Array<FieldFilter<T>>>(`${source}.filters`, [])
      .find((filter: FieldFilter<T>) => filter.target === target);

    if (!filter) {
      logger.warn(`No filter found for target ${target}`);
      return fields;
    }

    return fields.filter((field) => !filter.exclusions.includes(field));
  }
}
