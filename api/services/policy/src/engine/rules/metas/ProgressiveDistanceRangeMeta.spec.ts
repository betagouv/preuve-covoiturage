// import chai from 'chai';
// import { ProcessableCampaign } from '../../ProcessableCampaign';
// import { MetadataWrapper } from '../../MetadataWrapper';
// import { faker } from '../../helpers/faker';

// const meta = new MetadataWrapper(1, 'default', {});

// const { expect } = chai;

// const campaign = new ProcessableCampaign(
//   [],
//   [
//     [
//       {
//         slug: 'progressive_distance_range_meta',
//         parameters: {
//           min: 0,
//           max: 1000,
//         },
//       },
//       {
//         slug: 'fixed_amount_setter',
//         parameters: 30,
//       },
//       {
//         slug: 'per_km_modifier',
//       },
//     ],
//     [
//       {
//         slug: 'progressive_distance_range_meta',
//         parameters: {
//           min: 1000,
//           max: 5000,
//         },
//       },
//       {
//         slug: 'fixed_amount_setter',
//         parameters: 20,
//       },
//       {
//         slug: 'per_km_modifier',
//       },
//     ],
//     [
//       {
//         slug: 'progressive_distance_range_meta',
//         parameters: {
//           min: 5000,
//           max: 10000,
//         },
//       },
//       {
//         slug: 'fixed_amount_setter',
//         parameters: 10,
//       },
//       {
//         slug: 'per_km_modifier',
//       },
//     ],
//   ],
// );

// const uuid = 'uuid';

// const trip = faker.trip([
//   {
//     is_driver: true,
//     identity_uuid: uuid,
//     distance: 15000,
//   },
// ]);

// describe('Policy rule: progressive distance range meta', () => {
//   it('should work', async () => {
//     const data = {
//       trip,
//       meta,
//       result: 0,
//       stack: [],
//       person: trip.people[0],
//     };

//     await campaign.apply(data);

//     expect(data.result).to.eq(
//       1 * 30 + // de 0 à 1 km = 30cts
//       4 * 20 + // de 1 à 5 km = 20cts
//         5 * 10, // de 5 à 10 km = 10 cts
//     );
//   });
// });
