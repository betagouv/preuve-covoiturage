import {
  extension,
  RegisterHookInterface,
  ServiceContainerInterface,
  ValidatorInterfaceResolver,
} from "@/ilos/common/index.ts";
import { AjvValidator } from "./AjvValidator.ts";

@extension({
  name: "validator",
})
export class ValidatorExtension implements RegisterHookInterface {
  protected validators: [string, any][] = [];
  protected keywords: any[] = [];

  constructor(
    config:
      | [string, any][]
      | {
        validators?: [string, any][];
        keywords?: any[];
      },
  ) {
    if (Array.isArray(config)) {
      this.validators = config;
    } else {
      this.validators = config?.validators || [];
      this.keywords = config?.keywords || [];
    }
  }

  async register(serviceContainer: ServiceContainerInterface) {
    const container = serviceContainer.getContainer();
    if (!container.isBound(ValidatorInterfaceResolver)) {
      container.bind(ValidatorInterfaceResolver).to(AjvValidator);
    }
  }

  async init(serviceContainer: ServiceContainerInterface) {
    const validator = serviceContainer.getContainer().get(
      ValidatorInterfaceResolver,
    );

    // Init keywords
    this.keywords.forEach((keyword) => {
      validator.registerCustomKeyword(keyword);
    });

    // Init validators
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}
