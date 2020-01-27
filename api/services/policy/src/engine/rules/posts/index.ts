import { MetaAmountPost } from './MetaAmountPost';
import { StaticRuleInterface } from '../../interfaces';
import { MetaTripPost } from './MetaTripPost';
import { IdfmRegular } from './IdfmRegular';

export const posts: StaticRuleInterface[] = [MetaAmountPost, MetaTripPost, IdfmRegular];
