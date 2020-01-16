import { priority } from '../helpers/priority';
import { type } from '../helpers/type';
import { RuleHandlerParamsInterface } from '../interfaces';

export abstract class AbstractRule<P = any> {
  static readonly slug: string;
  static readonly index: priority;
  static readonly type: type;
  static readonly schema?: { [k:string]: any };
  static readonly description?: string;

  constructor(protected parameters?: P) {}

  abstract async apply(context: RuleHandlerParamsInterface): Promise<void>;
}