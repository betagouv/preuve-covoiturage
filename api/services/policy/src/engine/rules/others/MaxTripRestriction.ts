// import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
// import { FilterRule } from '../FilterRule';
// import { RuleHandlerContextInterface } from '../../interfaces';

// interface MaxTripParameters {
//   amount: number;
//   period: 'month' | 'campaign';
// }

// export class MaxTripRestriction extends FilterRule<MaxTripParameters> {
//   static readonly slug: string = 'max_trip_restriction';
//   static readonly description: string = 'Plafond de trajet par période';
//   static readonly schema: { [k:string]: any } = {
//     type: 'object',
//     required: ['amount', 'period'],
//     additionnalProperties: false,
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
//       const [month, year] = [datetime.getMonth(), datetime.getFullYear()];

//       let keyPeriod = 'global';
//       if (this.parameters.period === 'month') {
//         keyPeriod = `${month}-${year}`;
//       }

//       const key = `${MaxTripRestriction.slug}.${this.parameters.period}.${keyPeriod}`;
//       const periodConsuption = ctx.meta.get(key, 0);

//       // test if consuption > limit
//       if (periodConsuption >= this.parameters.amount) {
//         throw new NotApplicableTargetException(MaxTripRestriction);
//       }

//       await next();

//       ctx.meta.set(key, periodConsuption + 1);
//   }
// }