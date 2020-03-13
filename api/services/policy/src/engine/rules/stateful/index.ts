import { MetaAmountPost } from './MetaAmountPost';
import { StaticRuleInterface } from '../../interfaces';
import { MetaTripPost } from './MetaTripPost';

export const stateful: StaticRuleInterface[] = [MetaAmountPost, MetaTripPost];
