export interface ApplicationInterface {
  _id: number;
  uuid: string;
  name: string;
  owner_id: number;
  owner_service: string;
  created_at: Date;
}

export interface OperatorApplicationCreatedInterface {
  application: ApplicationInterface;
  token: string;
}
