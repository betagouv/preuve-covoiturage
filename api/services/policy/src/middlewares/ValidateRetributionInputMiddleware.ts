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
export class ValidateRetributionInputMiddleware implements MiddlewareInterface, InitHookInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async init() {
    for (const policy of policies) {
      this.validator.registerValidator(policy.schema, `policies.${policy.slug}`);
    }
  }

  async process(params: CampaignInterface, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    const retributionRules = params.retribution_rules;
    if (retributionRules) {
      const availablePolicies = policies.map((policy) => policy.slug);

      const notApplicablePolicies = retributionRules.filter((policy) => availablePolicies.indexOf(policy.slug) < 0);
      if (notApplicablePolicies.length > 0) {
        throw new InvalidParamsException(
          `Unknown retribution rules: ${notApplicablePolicies.map((rule) => rule.slug).join(', ')}`,
        );
      }

      for (const rule of retributionRules) {
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
