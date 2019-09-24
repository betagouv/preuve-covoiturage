import {
  MiddlewareInterface,
  ContextType,
  ResultType,
  ValidatorInterfaceResolver,
  InvalidParamsException,
  InitHookInterface,
  middleware,
} from '@ilos/common';
import { CampaignInterface } from '@pdc/provider-schema';

import { policies } from '../data/policies';

@middleware()
export class ValidateRuleParametersMiddleware implements MiddlewareInterface, InitHookInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async init() {
    for (const policy of policies) {
      if (policy.schema) {
        this.validator.registerValidator(policy.schema, `policies.${policy.slug}`);
      }
    }
  }

  async process(params: CampaignInterface, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    let rules = [];

    if (params.global_rules) {
      rules = [...rules, ...params.global_rules];
    }

    if (params.rules) {
      rules = [...rules, ...params.rules];
    }

    if (rules.length > 0) {
      const availablePolicies = policies.map((policy) => policy.slug);

      const notApplicablePolicies = rules.filter((policy) => availablePolicies.indexOf(policy.slug) < 0);
      if (notApplicablePolicies.length > 0) {
        throw new InvalidParamsException(
          `Unknown retribution rules: ${notApplicablePolicies.map((rule) => rule.slug).join(', ')}`,
        );
      }

      for (const rule of rules) {
        if (!('parameters' in rule)) {
          throw new InvalidParamsException(`Unparametred rule ${rule.slug}`);
        }
        try {
          await this.validator.validate(rule.parameters, `policies.${rule.slug}`);
        } catch (e) {
          throw new InvalidParamsException(e.message);
        }
      }
    }

    return next(params, context);
  }
}
