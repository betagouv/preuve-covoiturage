import { CarpoolEventName, CarpoolEventScope, Id } from '../interfaces';

export abstract class AbstractEvent {
  constructor(public carpool_id: Id, public relation_id: Id) {}

  public abstract scope: CarpoolEventScope;
  public abstract event: CarpoolEventName;
}

export enum EventScopeEnum {
  Request = 'request',
  Geo = 'geo',
  Incentive = 'incentive',
  Fraud = 'fraud',
}

/*
scope (request, geo, incentive, fraud)
event
  - request (received, updated, canceled)
  - geo (found, failed)
  - incentive (computed, finalized)
  - fraud (passed, failed)
*/
