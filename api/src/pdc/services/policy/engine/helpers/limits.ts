import { MetadataLifetime, StatefulContextInterface, StatelessContextInterface } from '../../interfaces';
import { MisconfigurationException } from '../exceptions/MisconfigurationException';

export enum LimitTargetEnum {
  Driver,
  Passenger,
}

export enum LimitCounterTypeEnum {
  Trip,
  Amount,
  Other,
}

export type ConfiguredLimitInterface = [string, number, LimitStatelessStageHelper, LimitTargetEnum?];

interface LimitStatelessStageHelper {
  counter: LimitCounterTypeEnum;
  priority: number;
  (ctx: StatelessContextInterface, uuid: string, target?: LimitTargetEnum): void;
}

function getTargetUuid(target: LimitTargetEnum, ctx: StatelessContextInterface): string {
  const uuid = target === LimitTargetEnum.Driver ? ctx.carpool.driver_identity_key : ctx.carpool.passenger_identity_key;
  return `${target.toString()}-${uuid}`;
}

export function applyLimitsOnStatelessStage(
  limits: Array<ConfiguredLimitInterface>,
  ctx: StatelessContextInterface,
): void {
  for (const [uuid, , fn, target] of limits) {
    fn(ctx, uuid, target);
  }
}

export function applyLimitsOnStatefulStage(
  limits: Array<ConfiguredLimitInterface>,
  ctx: StatefulContextInterface,
): void {
  const sortedLimits = [...limits];
  sortedLimits.sort(([_a, _aa, fna], [_b, _bb, fnb]) => (fnb.priority > fna.priority ? -1 : 1));

  for (const [uuid, max, fn] of sortedLimits) {
    applyLimitOnStatefulStage(ctx, uuid, max, fn);
  }
}

export const watchForGlobalMaxAmount: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    ctx.meta.register({
      uuid,
      name: 'max_amount_restriction',
      lifetime: MetadataLifetime.Always,
    });
  }
  fn.counter = LimitCounterTypeEnum.Amount;
  fn.priority = 33;
  return fn;
})();

export const watchForPersonMaxAmountByMonth: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: LimitTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_amount_restriction',
      scope: getTargetUuid(target, ctx),
      lifetime: MetadataLifetime.Month,
    });
  }
  fn.counter = LimitCounterTypeEnum.Amount;
  fn.priority = 32;
  return fn;
})();

export const watchForPersonMaxAmountByYear: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: LimitTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_amount_restriction',
      scope: getTargetUuid(target, ctx),
      lifetime: MetadataLifetime.Year,
    });
  }
  fn.counter = LimitCounterTypeEnum.Amount;
  fn.priority = 31;
  return fn;
})();

export const watchForGlobalMaxTrip: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      lifetime: MetadataLifetime.Always,
    });
  }
  fn.counter = LimitCounterTypeEnum.Trip;
  fn.priority = 23;
  return fn;
})();

export const watchForPersonMaxTripByMonth: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: LimitTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      scope: getTargetUuid(target, ctx),
      lifetime: MetadataLifetime.Month,
    });
  }
  fn.counter = LimitCounterTypeEnum.Trip;
  fn.priority = 22;
  return fn;
})();

export const watchForPersonMaxTripByDay: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string, target: LimitTargetEnum): void {
    ctx.meta.register({
      uuid,
      name: 'max_trip_restriction',
      scope: getTargetUuid(target, ctx),
      lifetime: MetadataLifetime.Day,
    });
  }
  fn.counter = LimitCounterTypeEnum.Trip;
  fn.priority = 21;
  return fn;
})();

export const watchForPassengerMaxByTripByDay: LimitStatelessStageHelper = (() => {
  function fn(ctx: StatelessContextInterface, uuid: string): void {
    if ('operator_trip_id' in ctx.carpool && ctx.carpool.operator_trip_id.length) {
      ctx.meta.register({
        uuid,
        name: 'max_passenger_restriction',
        scope: `${ctx.carpool.operator_id}.${ctx.carpool.operator_trip_id}`,
        lifetime: MetadataLifetime.Day,
        carpoolValue: ctx.carpool.seats,
      });
    }
  }
  fn.counter = LimitCounterTypeEnum.Other;
  fn.priority = 10;
  return fn;
})();

export function applyLimitOnStatefulStage(
  ctx: StatefulContextInterface,
  uuid: string,
  max: number,
  helper: LimitStatelessStageHelper,
): void {
  if (ctx.incentive.get() === 0) {
    return;
  }

  const state = ctx.meta.get(uuid);
  if (state >= max) {
    // limit is reached
    ctx.incentive.set(0);
    return;
  }

  switch (helper.counter) {
    case LimitCounterTypeEnum.Trip:
      ctx.meta.set(uuid, state + 1);
      return;
    case LimitCounterTypeEnum.Amount:
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
    case LimitCounterTypeEnum.Other:
      const raw = ctx.meta.getRaw(uuid);
      if (!raw.carpoolValue) {
        throw new MisconfigurationException('Missing carpool value');
      }
      ctx.meta.set(uuid, state + raw.carpoolValue);
      return;
  }
}
