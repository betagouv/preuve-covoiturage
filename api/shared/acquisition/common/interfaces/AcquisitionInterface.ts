import { JourneyInterface } from '../../../common/interfaces/JourneyInterface';

export interface AcquisitionInterface {
  _id: number;
  journey_id: string;
  operator_id: number;
  application_id: string;
  payload: JourneyInterface;
  created_at: Date;
}
