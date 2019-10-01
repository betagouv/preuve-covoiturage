export interface ApplicationInterface {
  _id: string;
  name: string;
  created_at: Date;
}

export interface OperatorApplicationCreatedInterface {
  application: ApplicationInterface;
  token: string;
}
