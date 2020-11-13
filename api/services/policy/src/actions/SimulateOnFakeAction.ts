import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import csvStringify, { Stringifier } from 'csv-stringify';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnFake.contract';

import { alias } from '../shared/policy/simulateOn.schema';
import { PolicyEngine } from '../engine/PolicyEngine';
import { FakerEngine } from '../engine/faker/FakerEngine';
import { InMemoryMetadataProvider } from '../engine/faker/InMemoryMetadataProvider';

interface SimulateResultInterface {
  trip_id: number;
  carpool_id: number;
  identity_uuid: string;
  operator_class: string;
  is_over_18: boolean;
  is_driver: boolean;
  has_travel_pass: boolean;
  datetime: Date;
  seats: number;
  distance: number;
  amount: number;
}

@handler({
  ...handlerConfig,
  middlewares: [
    [
      'scope.it',
      [
        [],
        [
          (params, context): string => {
            if (
              'campaign' in params &&
              'territory_id' in params.campaign &&
              params.campaign.territory_id === context.call.user.territory_id
            ) {
              return 'incentive-campaign.create';
            }
          },
        ],
      ],
    ],
    ['validate', alias],
    'validate.rules',
    ['validate.date', ['campaign', undefined, new Date()]],
  ],
})
export class SimulateOnFakeAction extends AbstractAction {
  constructor() {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Build engine with a in memory metadata
    const engine = new PolicyEngine(new InMemoryMetadataProvider());

    // 2. Build campaign
    const campaign = engine.buildCampaign(params.campaign);

    // 2. Generate trips
    const faker = FakerEngine.fromPolicy(params.campaign);
    const trips = faker.generate(50);
    const result: SimulateResultInterface[] = [];
    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      const incentives = await engine.process(campaign, trip);
      for (const person of trip) {
        result.push({
          trip_id: i,
          carpool_id: person.carpool_id,
          identity_uuid: person.identity_uuid,
          operator_class: person.operator_class,
          is_over_18: person.is_over_18,
          is_driver: person.is_driver,
          has_travel_pass: person.has_travel_pass,
          datetime: person.datetime,
          seats: person.seats,
          distance: person.distance,
          amount: incentives.find((i) => i.carpool_id === person.carpool_id).amount || 0,
        });
      }
    }

    return this.toCsv(result);
  }

  protected toCsv(result: SimulateResultInterface[]): string {
    const data = [];
    const stringifier = this.getStringifier(data);
    for (let i = 0; i < result.length; i++) {
      stringifier.write(result[i]);
    }
    stringifier.end();
    return data.join('\n');
  }

  protected getStringifier(data: string[]): Stringifier {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: [
        'trip_id',
        'carpool_id',
        'identity_uuid',
        'operator_class',
        'is_over_18',
        'is_driver',
        'has_travel_pass',
        'datetime',
        'seats',
        'distance',
        'amount',
      ],
      cast: { date: (d: Date): string => d.toISOString() },
    });
    stringifier.on('readable', async () => {
      let row;
      // tslint:disable-next-line: no-conditional-assignment
      while (null !== (row = stringifier.read())) {
        data.push(row);
      }
    });

    stringifier.on('error', (err) => {
      console.error(err.message);
    });

    return stringifier;
  }
}
