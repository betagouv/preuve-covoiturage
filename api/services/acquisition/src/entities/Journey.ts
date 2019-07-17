// tslint:disable: variable-name
import { JourneyInterface, PersonInterface } from '@pdc/provider-schema';

export class Journey implements JourneyInterface {
  public _id?: string;
  public journey_id: string;
  public operator_journey_id: string;
  public operator_class?: string;
  public operator_id: string;
  public passenger?: PersonInterface;
  public driver?: PersonInterface;

  constructor(data: JourneyInterface) {
    this._id = data._id;

    this.journey_id = data.journey_id;
    this.operator_journey_id = data.operator_journey_id;
    this.operator_class = data.operator_class;
    this.operator_id = data.operator_id;
    this.passenger = data.passenger;
    this.driver = data.driver;
  }
}
