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
import { rules } from '../engine/rules';

const availablePolicieSlugs = rules.map((policy) => policy.slug);
const noParameterRuleSlugs = rules.filter((r) => !('schema' in r)).map((r) => r.slug);

// TODO : refactor
@middleware()
export class ValidateRuleParametersMiddleware implements MiddlewareInterface, InitHookInterface {
  constructor(private validator: ValidatorInterfaceResolver) {}

  async init(): Promise<void> {
    for (const policy of rules) {
      if (policy.schema) {
        this.validator.registerValidator(policy.schema, `policies.${policy.slug}`);
      }
    }
  }

  async process(params: CampaignInterface, context: ContextType, next?: Function, options?: any): Promise<ResultType> {
    console.log('>> ');
    const globalRules = params.global_rules && params.global_rules.length ? params.global_rules : [];
    const ruleSets = params.rules && params.rules.length ? [globalRules, ...params.rules] : [globalRules];

    for (const ruleSet of ruleSets) {
      if (ruleSet.length && ruleSet.length > 0) {
        const notApplicablePolicies = ruleSet.filter((policy) => availablePolicieSlugs.indexOf(policy.slug) < 0);
        if (notApplicablePolicies.length > 0) {
          console.log('!! Unknown retribution rules');

          throw new InvalidParamsException(
            `Unknown retribution rules: ${notApplicablePolicies.map((rule) => rule.slug).join(', ')}`,
          );
        }

        for (const rule of ruleSet) {
          if ('parameters' in rule) {
            try {
              await this.validator.validate(rule.parameters, `policies.${rule.slug}`);
            } catch (e) {
              console.log(' rule ', rule);
              console.log('!! e : ', e);
              throw new InvalidParamsException(e.message);
            }
          } else {
            if (noParameterRuleSlugs.indexOf(rule.slug) < 0) {
              console.log(' rule ', rule);
              console.log('!! InvalidParamsException e : ', `Unconfigured rule ${rule.slug}`);

              throw new InvalidParamsException(`Unconfigured rule ${rule.slug}`);
            }
          }
        }
      }
    }

    console.log('OK');

    return next(params, context);
  }
}
