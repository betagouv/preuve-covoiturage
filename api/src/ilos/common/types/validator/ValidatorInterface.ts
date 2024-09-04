import { ErrorObject } from "@/deps.ts";
import { ProviderInterface } from "../core/index.ts";
import { NewableType } from "../shared/index.ts";

export interface ValidatorInterface extends ProviderInterface {
  errors: ErrorObject[];
  registerValidator(
    definition: any,
    target?: NewableType<any> | string,
  ): ValidatorInterface;
  registerCustomKeyword(definition: any): ValidatorInterface;
  validate(data: any, validator?: string): Promise<boolean>;
}

export abstract class ValidatorInterfaceResolver implements ValidatorInterface {
  errors: ErrorObject[] = [];
  boot(): void {
    return;
  }
  registerValidator(
    definition: any,
    target?: NewableType<any> | string,
  ): ValidatorInterface {
    throw new Error();
  }
  registerCustomKeyword(definition: any): ValidatorInterface {
    throw new Error();
  }
  async validate(data: any, validator?: string): Promise<boolean> {
    throw new Error();
  }
}
