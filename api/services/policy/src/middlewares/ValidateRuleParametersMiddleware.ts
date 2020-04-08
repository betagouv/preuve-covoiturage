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
import { RuleInterface } from '../engine/interfaces';
import { STATEFUL, FILTER } from '../engine/helpers/type';

const availablePolicieSlugs = rules.map((policy) => policy.slug);
const noParameterRuleSlugs = rules.filter((r) => !('schema' in r)).map((r) => r.slug);
const statefuleRuleSlugs = rules.filter((r) => r.type === STATEFUL).map((r) => r.slug);
const filterRuleSlugs = rules.filter((r) => r.type === FILTER).map((r) => r.slug);

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
    // TODO :
    // - uuid on stateful + no duplicate
    // - filter/stateful only on global
    // -
    const globalRules = params.global_rules && params.global_rules.length ? params.global_rules : [];
    const ruleSets = params.rules && params.rules.length ? params.rules : [];

    await this.validateRules([globalRules, ...ruleSets]);
    this.validateGlobalRules(globalRules);

    return next(params, context);
  }

  protected async validateRules(ruleSets: RuleInterface[][]): Promise<void> {
    const uuidSet: Set<string> = new Set();
    for (const ruleSet of ruleSets) {
      for (const rule of ruleSet) {
        this.ruleExists(rule);
        await this.properlyParametred(rule);
        await this.statefulHaveUniqueUuid(rule, uuidSet);
      }
    }
  }

  protected validateGlobalRules(ruleSet: RuleInterface[]): void {
    if (
      ruleSet.filter((r) => filterRuleSlugs.indexOf(r.slug) < 0 && statefuleRuleSlugs.indexOf(r.slug) < 0).length > 0
    ) {
      throw new InvalidParamsException(`Global rules accept only filter and statefule rules`);
    }
  }

  protected ruleExists(rule: RuleInterface): void {
    if (availablePolicieSlugs.indexOf(rule.slug) < 0) {
      throw new InvalidParamsException(`Unknown retribution rule: ${rule.slug}`);
    }
  }

  protected async properlyParametred(rule: RuleInterface): Promise<void> {
    if (!('parameters' in rule) && !this.shouldBeParametred(rule)) {
      return;
    }
    try {
      await this.validator.validate(rule.parameters, `policies.${rule.slug}`);
    } catch (e) {
      throw new InvalidParamsException(e.message);
    }
  }

  protected shouldBeParametred(rule: RuleInterface): boolean {
    return noParameterRuleSlugs.indexOf(rule.slug) < 0;
  }

  protected statefulHaveUniqueUuid(rule: RuleInterface, uuidSet: Set<string>): void {
    if (statefuleRuleSlugs.indexOf(rule.slug) < 0) {
      return;
    }

    if (!('uuid' in rule.parameters) || uuidSet.has(rule.parameters.uuid)) {
      throw new InvalidParamsException(`${rule.slug} should have an unique id`);
    }

    uuidSet.add(rule.parameters.uuid);
  }
}
