import { Types, Interfaces } from '@pdc/core';

export interface ValidatorProviderInterface extends Interfaces.ProviderInterface {
  registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorProviderInterface;
  registerCustomKeyword(definition: any): ValidatorProviderInterface;
  validate(data: any, validator?: string): Promise<boolean>;
}

export abstract class ValidatorProviderInterfaceResolver implements ValidatorProviderInterface {
  boot(): Promise<void> | void {
    throw new Error();
  }
  registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorProviderInterface {
    throw new Error();
  }
  registerCustomKeyword(definition: any): ValidatorProviderInterface {
    throw new Error();
  }
  async validate(data: any, validator?: string): Promise<boolean> {
    throw new Error();
  }
}
