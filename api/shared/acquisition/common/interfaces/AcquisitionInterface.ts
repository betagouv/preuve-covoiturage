import { JourneyInterface } from '../../../common/interfaces/JourneyInterface';

export interface AcquisitionInterface {
  _id: string;
  journey_id: string;
  operator_id: string;
  application_id: string;
  payload: JourneyInterface;
  created_at: Date;
}
