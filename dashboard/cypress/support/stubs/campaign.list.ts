import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { TripClassEnum } from '../../../src/app/core/enums/trip/trip-class.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';

export const campaignStubs: Campaign[] = [
  {
    _id: '5d7775bf37043b8463b2a208',
    template_id: '5d6930724f56e6e1d0654542',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    rules: {
      weekday: [0, 1, 2, 3, 4, 5, 6],
      time: [
        {
          start: '08:00',
          end: '19:00',
        },
      ],
      range: [0, 100],
      ranks: [TripClassEnum.A, TripClassEnum.B],
      onlyAdult: false,
      forDriver: true,
      forPassenger: true,
      forTrip: false,
      operatorIds: [],
    },
    start: null,
    end: null,
    max_trips: null,
    max_amount: null,
    amount_unit: IncentiveUnitEnum.EUR,
    restrictions: [],
    formula_expression: '',
    formulas: [],
    expertMode: false,
  },
  {
    _id: '5d777822ff790e51107c6c4f',
    template_id: '5d69319a9763dc801ea78de7',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter le trafic en semaine',
    description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
    rules: {
      weekday: [0, 1, 2, 3, 4],
      time: [
        {
          start: '06:00',
          end: '09:00',
        },
        {
          start: '16:00',
          end: '19:00',
        },
      ],
      range: [0, 15],
      ranks: [TripClassEnum.A, TripClassEnum.B, TripClassEnum.C],
      onlyAdult: false,
      forDriver: true,
      forPassenger: true,
      forTrip: false,
      operatorIds: [],
    },
    start: null,
    end: null,
    max_trips: null,
    max_amount: null,
    amount_unit: IncentiveUnitEnum.EUR,
    restrictions: [],
    formula_expression: '',
    formulas: [],
    expertMode: false,
  },
  {
    _id: '5d77782eecbdea02802a81eb',
    template_id: null,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    rules: {
      weekday: [0],
      time: [],
      range: [0, 15],
      ranks: [],
      onlyAdult: false,
      forDriver: true,
      forPassenger: true,
      forTrip: false,
      operatorIds: [],
    },
    start: null,
    end: null,
    max_trips: null,
    max_amount: null,
    amount_unit: IncentiveUnitEnum.EUR,
    restrictions: [],
    formula_expression: '',
    formulas: [],
    expertMode: false,
  },
];

export function stubCampaignList() {
  cy.route({
    method: 'POST',
    url: '/api?methods=campaign.list',
    response: (data) => campaignStubs,
  });
}
