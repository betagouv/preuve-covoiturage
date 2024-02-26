import { InsertableCarpoolCancelRequest, InsertableCarpoolCreateRequest } from '../../interfaces';

export const insertableCarpoolCreateRequest: InsertableCarpoolCreateRequest = {
  carpool_id: 1,
  operator_id: 1,
  operator_journey_id: 'journey_id',
  api_version: 3,
  payload: {
    test: 'payload',
  },
};

export const insertableCarpoolCancelRequest: InsertableCarpoolCancelRequest = {
  carpool_id: 1,
  operator_id: 1,
  operator_journey_id: 'journey_id',
  api_version: 3,
  cancel_code: 'FRAUD',
  cancel_message: 'toto',
};
