// import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
// import { FilterRule } from '../FilterRule';
// import { RuleHandlerContextInterface } from '../../interfaces';

// interface MaxAmountParameters {
//   amount: number;
//   period: string;
// }

// export class MaxAmountRestriction extends FilterRule<MaxAmountParameters> {
//   static readonly slug: string = 'max_amount_restriction';
//   static readonly description: string = "Plafond d'unité par période";
//   static readonly schema: { [k:string]: any } = {
//     type: 'object',
//     required: ['amount', 'period'],
//     additionalProperties: false,
//     properties: {
//       amount: {
//         type: 'integer',
//         minimum: 0,
//       },
//       period: {
//         type: 'string',
//         enum: ['month', 'campaign'],
//       },
//     },
//   };


//   async apply(ctx: RuleHandlerContextInterface, next: () => Promise<void>): Promise<void> {
//     const datetime = ctx.person.datetime;
//     const [month, year] = [datetime.getMonth(), datetime.getFullYear()];
//     let keyPeriod = 'global';
//     if (this.parameters.period === 'month') {
//       keyPeriod = `${month}-${year}`;
//     }

//     const key = `${MaxAmountRestriction.slug}.${this.parameters.period}.${keyPeriod}`;
//     const periodConsuption = ctx.meta.get(key, 0);

//     // test if consuption > limit
//     if (periodConsuption >= this.parameters.amount) {
//       throw new NotApplicableTargetException(MaxAmountRestriction);
//     }

//     await next();

//     ctx.meta.set(key, periodConsuption + ctx.result);
//   }
// }
