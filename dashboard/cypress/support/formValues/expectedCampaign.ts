import { Campaign } from '../../../src/app/core/entities/campaign/campaign';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { TripClassEnum } from '../../../src/app/core/enums/trip/trip-class.enum';

import { operatorStubs } from '../stubs/operator.list';

export const startMoment = Cypress.moment()
  .add(1, 'days')
  .startOf('day');
export const endMoment = Cypress.moment()
  .add(3, 'months')
  .startOf('day');

export const expectedCampaign = new Campaign({
  _id: null,
  start: startMoment.toDate(),
  end: endMoment.toDate(),
  amount_unit: IncentiveUnitEnum.EUR,
  description: '',
  expertMode: false,
  formula_expression: '0.1 € par trajet par km, 0.2 € par trajet pour le(s) passager(s).',
  formulas: [
    {
      formula: '0.2*pour_passager+0.1*pour_conducteur*distance',
    },
  ],
  max_amount: 100000,
  max_trips: 50000,
  name: "Nouvelle campagne d'incitation",
  restrictions: [],
  rules: {
    weekday: [0],
    time: [],
    range: [85, 150],
    ranks: [TripClassEnum.A, TripClassEnum.C],
    onlyAdult: null,
    forDriver: true,
    forPassenger: true,
    forTrip: null,
    operatorIds: [operatorStubs[0]._id],
  },
  status: CampaignStatusEnum.VALIDATED,
  template_id: null,
  trips_number: null,
});
