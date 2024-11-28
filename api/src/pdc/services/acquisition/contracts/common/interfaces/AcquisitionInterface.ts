import { JourneyInterface } from "@/shared/common/interfaces/JourneyInterface.ts";

export interface AcquisitionInterface {
  _id: number;
  journey_id: string;
  operator_id: number;
  application_id: number;
  payload: JourneyInterface;
  created_at: Date;
}
