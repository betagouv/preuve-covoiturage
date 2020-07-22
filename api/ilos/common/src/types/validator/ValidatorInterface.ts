import { NewableType } from '../shared';
import { ProviderInterface } from '../core';

export interface ValidatorInterface extends ProviderInterface {
  registerValidator(definition: any, target?: NewableType<any> | string): ValidatorInterface;
  registerCustomKeyword(definition: any): ValidatorInterface;
  validate(data: any, validator?: string): Promise<boolean>;
}

export abstract class ValidatorInterfaceResolver implements ValidatorInterface {
  boot(): void {
    return;
  }
  registerValidator(definition: any, target?: NewableType<any> | string): ValidatorInterface {
    throw new Error();
  }
  registerCustomKeyword(definition: any): ValidatorInterface {
    throw new Error();
  }
  async validate(data: any, validator?: string): Promise<boolean> {
    throw new Error();
  }
}
