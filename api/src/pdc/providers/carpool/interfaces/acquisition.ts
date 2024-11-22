import { ApiVersion, CancelCode, CancelMessage, Id, TermsViolationErrorLabels, Uuid } from "./common.ts";
import { InsertableCarpool, UpdatableCarpool } from "./database/carpool.ts";

interface ApiVersionObject {
  api_version: ApiVersion;
}

export type RegisterRequest = InsertableCarpool & ApiVersionObject;
export type RegisterResponse = {
  created_at: Date;
  terms_violation_error_labels: TermsViolationErrorLabels;
};

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
