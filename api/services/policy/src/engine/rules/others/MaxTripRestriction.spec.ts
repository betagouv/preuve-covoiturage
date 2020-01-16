// import chai from 'chai';
// import chaiAsync from 'chai-as-promised';
// import { MaxTripRestriction } from './MaxTripRestriction';
// import { compose } from '../../helpers/compose';
// import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';
// import { MetadataWrapper } from '../../MetadataWrapper';
// import { faker } from '../../helpers/faker';

// const meta = new MetadataWrapper(1, 'default', {});

// chai.use(chaiAsync);
// const { expect } = chai;

// const apply = compose([
//   new MaxTripRestriction({
//     amount: 1,
//     period: 'month',
//   }).apply,
//   async (ctx): Promise<void> => {
//     ctx.result = 10;
//   },
// ]);

// const trip = faker.trip([{}]);

// describe('Policy rule: max trip', () => {
//   it('should increase meta data', async () => {
//     const data = {
//       result: 0,
//       person: trip.people[0],
//       trip,
//       meta,
//     };
//     await apply(data, async () => {});
//     const datetime = trip.people[0].datetime;
//     const [month, year] = [datetime.getMonth(), datetime.getFullYear()];
//     expect(meta.get(`${MaxTripRestriction.slug}.month.${month}-${year}`, null)).to.eq(1);
//   });

//   it('should raise error if limit is reached', () => {
//     const data = {
//       result: 0,
//       person: trip.people[0],
//       trip,
//       meta,
//     };
//     return expect(apply(data)).to.eventually.rejectedWith(NotApplicableTargetException, MaxTripRestriction.description);
//   });
// });
