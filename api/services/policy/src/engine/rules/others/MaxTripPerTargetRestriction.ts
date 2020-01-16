// import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
// import { FilterRule } from '../FilterRule';
// import { RuleHandlerContextInterface } from '../../interfaces';

// interface MaxTripParameters {
//   target: 'driver' | 'passenger';
//   amount: number;
//   period: 'day' | 'month' | 'year' | 'campaign';
// }

// export class MaxTripPerTargetRestriction extends FilterRule<MaxTripParameters> {
//   static readonly slug: string = 'max_trip_per_target_restriction';
//   static readonly description: string = 'Trajet maximum par personne';
//   static readonly schema: { [k:string]: any } = {
//     type: 'object',
//     required: ['target', 'amount', 'period'],
//     additionalProperties: false,
//     properties: {
//       target: {
//         type: 'string',
//         enum: ['driver', 'passenger'],
//       },
//       amount: {
//         type: 'integer',
//         minimum: 0,
//       },
//       period: {
//         type: 'string',
//         enum: ['day', 'month', 'year', 'campaign'],
//       },
//     },
//   };

//   async apply(ctx: RuleHandlerContextInterface, next: () => Promise<void>): Promise<void> {
//     if (
//       (this.parameters.target === 'driver' && !ctx.person.is_driver) ||
//       (this.parameters.target === 'passenger' && ctx.person.is_driver)
//     ) {
//       return next();
//     }

//     const datetime = ctx.person.datetime;
//     const [day, month, year] = [datetime.getDate(), datetime.getMonth(), datetime.getFullYear()];
//     let keyPeriod = 'global';
//     switch (this.parameters.period) {
//       case 'day':
//         keyPeriod = `${day}-${month}-${year}`;
//         break;
//       case 'month':
//         keyPeriod = `${month}-${year}`;
//         break;
//       case 'year':
//         keyPeriod = `${year}`;
//         break;
//     }

//     const key = `${MaxTripPerTargetRestriction.slug}.${ctx.person.identity_uuid}.${this.parameters.period}.${keyPeriod}`;
//     const periodConsuption = ctx.meta.get(key, 0);

//     // test if consuption > limit
//     if (periodConsuption >= this.parameters.amount) {
//       throw new NotApplicableTargetException(MaxTripPerTargetRestriction);
//     }

//     await next();

//     ctx.meta.set(key, periodConsuption + 1);
//   }
// }
