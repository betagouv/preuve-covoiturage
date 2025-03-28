import { CommandOptions } from "@/ilos/common/types/command/CommandInterface.ts";
import { injectable } from "dep:inversify";
import { identifierCfg } from "../cli/constants.ts";

export function command(config: CommandOptions) {
  return function (target: any) {
    Reflect.defineMetadata(identifierCfg, config, target);
    return injectable()(target);
  };
}
