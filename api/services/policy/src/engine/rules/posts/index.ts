import { MetaAmountPost } from './MetaAmountPost';
import { StaticRuleInterface } from '../../interfaces';
import { MetaTripPost } from './MetaTripPost';
import { IdfmRegular } from './IdfmRegular';
import { IdfmStrikeJan2020 } from './IdfmStrikeJan2020';

export const posts: StaticRuleInterface[] = [MetaAmountPost, MetaTripPost, IdfmRegular, IdfmStrikeJan2020];
