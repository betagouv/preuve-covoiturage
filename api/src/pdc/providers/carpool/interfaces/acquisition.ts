import { ApiVersion, CancelCode, CancelMessage, Id, Uuid } from "./common.ts";
import { InsertableCarpool, UpdatableCarpool } from "./database/carpool.ts";

interface ApiVersionObject {
  api_version: ApiVersion;
}

export type RegisterRequest = InsertableCarpool & ApiVersionObject;

export interface UpdateRequest extends UpdatableCarpool, ApiVersionObject {
  operator_id: Id;
  operator_journey_id: Uuid;
}

export interface CancelRequest extends ApiVersionObject {
  operator_id: Id;
  operator_journey_id: Uuid;
  cancel_code: CancelCode;
  cancel_message: CancelMessage;
}
