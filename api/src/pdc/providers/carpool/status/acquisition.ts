import { CarpoolAcquisitionStatusEnum, Id } from '../interfaces';
import { AbstractStatus } from './AbstractStatus';

export class CarpoolAcquisitionStatus extends AbstractStatus {
  public status: CarpoolAcquisitionStatusEnum;

  constructor(carpool_id: Id, relation_id: Id, status: CarpoolAcquisitionStatusEnum) {
    super(carpool_id, relation_id);
    this.status = status;
  }

  get request_id() {
    return this.relation_id;
  }
}
