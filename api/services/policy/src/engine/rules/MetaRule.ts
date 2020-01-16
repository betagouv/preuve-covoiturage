import { RuleInterface, MetaRuleInterface } from '../interfaces';
import { AbstractRule } from './AbstractRule';

export abstract class MetaRule<P = any> extends AbstractRule<P> implements MetaRuleInterface {
  abstract build(): RuleInterface[];
}
