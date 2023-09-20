import { AbstractEvent, EventScopeEnum } from './AbstractEvent';

export enum EventRequestTypeEnum {
  Received = 'received',
  Updated = 'updated',
  Canceled = 'canceled',
}

export class CarpoolRequestReceivedEvent extends AbstractEvent {
  public scope = EventScopeEnum.Request;
  public event = EventRequestTypeEnum.Received;
}

export class CarpoolRequestUpdatedEvent extends AbstractEvent {
  public scope = EventScopeEnum.Request;
  public event = EventRequestTypeEnum.Updated;
}

export class CarpoolRequestCanceledEvent extends AbstractEvent {
  public scope = EventScopeEnum.Request;
  public event = EventRequestTypeEnum.Canceled;
}
