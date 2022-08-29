import { MetadataLifetime, StatefulContextInterface, StatelessContextInterface } from '../../interfaces';

export function setMax(
  uuid: string,
  max: number,
  fn: (ctx: StatelessContextInterface, uuid: string) => void,
  forTrip: boolean = false,
): [(ctx: StatelessContextInterface) => void, (ctx: StatefulContextInterface) => void] {
  return [
    (ctx: StatelessContextInterface) => fn(ctx, uuid),
    (ctx: StatefulContextInterface) => applyForMaximum(ctx, uuid, max, forTrip),
  ];
}

export function watchForGlobalMaxAmount(ctx: StatelessContextInterface, uuid: string): void {
  ctx.meta.register({
    uuid,
    name: 'max_amount_restriction',
    lifetime: MetadataLifetime.Always,
  });
}

export function watchForPersonMaxAmountByMonth(ctx: StatelessContextInterface, uuid: string): void {
  ctx.meta.register({
    uuid,
    name: 'max_amount_restriction',
    scope: ctx.carpool.identity_uuid,
    lifetime: MetadataLifetime.Month,
  });
}

export function watchForPersonMaxTripByMonth(ctx: StatelessContextInterface, uuid: string): void {
  ctx.meta.register({
    uuid,
    name: 'max_trip_restriction',
    scope: ctx.carpool.identity_uuid,
    lifetime: MetadataLifetime.Month,
  });
}

export function watchForPersonMaxTripByDay(ctx: StatelessContextInterface, uuid: string): void {
  ctx.meta.register({
    uuid,
    name: 'max_trip_restriction',
    scope: ctx.carpool.identity_uuid,
    lifetime: MetadataLifetime.Day,
  });
}

export function applyForMaximum(ctx: StatefulContextInterface, uuid: string, max: number, forTrip: boolean): void {
  const state = ctx.meta.get(uuid);
  if (state >= max) {
    // limit is reached
    ctx.incentive.set(0);
    return;
  }

  // apply for trip
  if(forTrip) {
    ctx.meta.set(uuid, state + 1);
    return;
  }

  // apply for amount
  const incentive = ctx.incentive.get();
  const delta = state + incentive;
  if (delta >= max) {
    // limit will be reached, get diff
    ctx.meta.set(uuid, max);
    ctx.incentive.set(max - state);
    return;
  }
  // save new state
  ctx.meta.set(uuid, state + incentive);
  return;
}
