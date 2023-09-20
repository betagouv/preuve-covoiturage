import { CarpoolEventName, CarpoolEventScope, Id } from '../common';

export interface InsertableCarpoolEvent {
  carpool_id: Id;
  relation_id: Id;
  scope: CarpoolEventScope;
  event: CarpoolEventName;
}
