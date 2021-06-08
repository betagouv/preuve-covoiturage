import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { CsvRecordInterface } from '../interfaces/CsvRecordInterface';
import { ParamsInterface } from '../shared/acquisition/create.contract';

export function csvRecordToCreatePayload(input: Partial<CsvRecordInterface>): Partial<ParamsInterface> {
  const { journey_id, operator_journey_id, operator_class } = input;
  return removeEmptyKeys({
    journey_id,
    operator_journey_id,
    operator_class,
    driver: castPerson('driver', input),
    passenger: castPerson('passenger', input),
  });
}

function key(prefix: string, ...suffix: string[]): string {
  return [prefix, ...suffix].join('_');
}

function removeEmptyKeys(obj: { [k: string]: any }): { [k: string]: any } {
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}

function castPerson(target: string, input: Partial<CsvRecordInterface>): Partial<PersonInterface> {
  const identity = {
    firstname: input[key(target, 'identity', 'firstname')],
    lastname: input[key(target, 'identity', 'lastname')],
    email: input[key(target, 'identity', 'email')],
    phone: input[key(target, 'identity', 'phone')],
    phone_trunc: input[key(target, 'identity', 'phone_trunc')],
    operator_user_id: input[key(target, 'identity', 'operator_user_id')],
    company: input[key(target, 'identity', 'company')],
    over_18: input[key(target, 'identity', 'over_18')],
    travel_pass: input[key(target, 'identity', 'travel_pass')],
  };

  const start = {
    datetime: input[key(target, 'start', 'datetime')],
    lat: input[key(target, 'start', 'lat')],
    lon: input[key(target, 'start', 'lon')],
    insee: input[key(target, 'start', 'insee')],
    country: input[key(target, 'start', 'country')],
    literal: input[key(target, 'start', 'literal')],
  };

  const end = {
    datetime: input[key(target, 'end', 'datetime')],
    lat: input[key(target, 'end', 'lat')],
    lon: input[key(target, 'end', 'lon')],
    insee: input[key(target, 'end', 'insee')],
    country: input[key(target, 'end', 'country')],
    literal: input[key(target, 'end', 'literal')],
  };

  const incentives = [];

  for (let i = 1; i <= 4; i++) {
    const siret = input[key(target, 'incentive', i.toString(), 'siret')];
    if (siret) {
      incentives.push({
        siret,
        index: i,
        amount: input[key(target, 'incentive', i.toString(), 'amount')],
      });
    }
  }

  const payments = [];
  for (let i = 1; i <= 4; i++) {
    const siret = input[key(target, 'payment', i.toString(), 'siret')];
    if (siret) {
      payments.push({
        siret,
        index: i,
        amount: input[key(target, 'payment', i.toString(), 'amount')],
        type: input[key(target, 'payment', i.toString(), 'type')],
      });
    }
  }

  return removeEmptyKeys({
    identity: removeEmptyKeys(identity),
    start: removeEmptyKeys(start),
    end: removeEmptyKeys(end),
    payments,
    incentives,
    distance: input[key(target, 'distance')],
    duration: input[key(target, 'duration')],
    seats: input[key(target, 'seats')],
    contribution: input[key(target, 'contribution')],
    revenue: input[key(target, 'revenue')],
  });
}
