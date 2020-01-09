import {
  MiddlewareInterface,
  ContextType,
  ResultType,
  ValidatorInterfaceResolver,
  InvalidParamsException,
  InitHookInterface,
  middleware,
} from '@ilos/common';

import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import { policies } from '../engine/rules';

@middleware()
export class ValidateRuleParametersMiddleware implements MiddlewareInterface, InitHookInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async init(): Promise<void> {
    for (const policy of policies) {
      if (policy.schema) {
        this.validator.registerValidator(policy.schema, `policies.${policy.slug}`);
      }
    }
  }

  async process(params: CampaignInterface, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    const availablePolicies = policies.map((policy) => policy.slug);
    const globalRules = params.global_rules && params.global_rules.length ? params.global_rules : [];
    const ruleSets = params.rules && params.rules.length ? [globalRules, ...params.rules] : [globalRules];

    for (const ruleSet of ruleSets) {
      if (ruleSet.length && ruleSet.length > 0) {
        const notApplicablePolicies = ruleSet.filter((policy) => availablePolicies.indexOf(policy.slug) < 0);
        if (notApplicablePolicies.length > 0) {
          throw new InvalidParamsException(
            `Unknown retribution rules: ${notApplicablePolicies.map((rule) => rule.slug).join(', ')}`,
          );
        }

        for (const rule of ruleSet) {
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
    }

    return next(params, context);
  }
}
