import { MetadataLifetime, StatefulContextInterface, StatelessContextInterface } from '../../interfaces';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';

export enum MaximumTargetEnum {
  Driver,
  Passenger,
}

export enum MaximumCounterEnum {
  Trip,
  Amount,
  Other,
}

interface MaximumStatelessHelper {
  counter: MaximumCounterEnum;
  (ctx: StatelessContextInterface, uuid: string, target?: MaximumTargetEnum): void;
}

export function setMax(
  uuid: string,
  max: number,
  fn: MaximumStatelessHelper,
  target: MaximumTargetEnum = MaximumTargetEnum.Passenger,
): [(ctx: StatelessContextInterface) => void, (ctx: StatefulContextInterface) => void] {
  return [
    (ctx: StatelessContextInterface) => fn(ctx, uuid, target),
    (ctx: StatefulContextInterface) => applyForMaximum(ctx, uuid, max, fn),
  ];
}

export const watchForGlobalMaxTrip: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      lifetime: MetadataLifetime.Always,
    });
  }
  fn.counter = MaximumCounterEnum.Trip;
  return fn;
})();

export const watchForGlobalMaxAmount: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    ctx.meta.register({
      uuid,
      name: 'max_amount_restriction',
      lifetime: MetadataLifetime.Always,
    });
  }
  fn.counter = MaximumCounterEnum.Amount;
  return fn;
})();

export const watchForPersonMaxAmountByMonth: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: MaximumTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_amount_restriction',
      scope:
        target === MaximumTargetEnum.Driver ? ctx.carpool.driver_identity_uuid : ctx.carpool.passenger_identity_uuid,
      lifetime: MetadataLifetime.Month,
    });
  }
  fn.counter = MaximumCounterEnum.Amount;
  return fn;
})();

export const watchForPersonMaxTripByMonth: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: MaximumTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      scope:
        target === MaximumTargetEnum.Driver ? ctx.carpool.driver_identity_uuid : ctx.carpool.passenger_identity_uuid,
      lifetime: MetadataLifetime.Month,
    });
  }
  fn.counter = MaximumCounterEnum.Trip;
  return fn;
})();

export const watchForPersonMaxTripByDay: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: MaximumTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      scope:
        target === MaximumTargetEnum.Driver ? ctx.carpool.driver_identity_uuid : ctx.carpool.passenger_identity_uuid,
      lifetime: MetadataLifetime.Day,
    });
  }
  fn.counter = MaximumCounterEnum.Trip;
  return fn;
})();

export const watchForPassengerMaxByTripByDay: MaximumStatelessHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    ctx.meta.register({
      uuid,
      name: 'max_passenger_restriction',
      scope: ctx.carpool.trip_id,
      lifetime: MetadataLifetime.Day,
      carpoolValue: ctx.carpool.seats,
    });
  }
  fn.counter = MaximumCounterEnum.Other;
  return fn;
})();

export function applyForMaximum(
  ctx: StatefulContextInterface,
  uuid: string,
  max: number,
  helper: MaximumStatelessHelper,
): void {
  const state = ctx.meta.get(uuid);
  if (state >= max) {
    // limit is reached
    ctx.incentive.set(0);
    return;
  }

  switch (helper.counter) {
    case MaximumCounterEnum.Trip:
      ctx.meta.set(uuid, state + 1);
      return;
    case MaximumCounterEnum.Amount:
      const incentive = ctx.incentive.get();
      const delta = state + incentive;
      if (delta >= max) {
        // limit will be reached, get diff
        ctx.meta.set(uuid, max);
        ctx.incentive.set(max - state);
        return;
      }
      ctx.meta.set(uuid, state + incentive);
      return;
    case MaximumCounterEnum.Other:
      const raw = ctx.meta.getRaw(uuid);
      if (!raw.carpoolValue) {
        throw new MisconfigurationException('Missing carpool value');
      }
      ctx.meta.set(uuid, state + raw.carpoolValue);
      return;
  }
}
