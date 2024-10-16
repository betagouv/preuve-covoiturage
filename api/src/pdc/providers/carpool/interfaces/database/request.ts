import {
  ApiVersion,
  CancelCode,
  CancelMessage,
  Id,
  Payload,
  Uuid,
} from "../common.ts";

export interface InsertableCarpoolCreateRequest {
  carpool_id: Id;
  operator_id: Id;
  operator_journey_id: Uuid;
  payload: Payload;
  api_version: ApiVersion;
  created_at?: Date;
}

export interface InsertableCarpoolCancelRequest {
  carpool_id: Id;
  operator_id: Id;
  operator_journey_id: Uuid;
  api_version: ApiVersion;
  cancel_code: CancelCode;
  cancel_message: CancelMessage;
  created_at?: Date;
}

export type InsertableCarpoolRequest =
  | InsertableCarpoolCreateRequest
  | InsertableCarpoolCancelRequest;

export interface WrittenCarpoolRequest {
  _id: Id;
  created_at: Date;
}
