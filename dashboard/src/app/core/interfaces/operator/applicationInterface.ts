export interface ApplicationInterface {
  _id: number;
  name: string;
  created_at: Date;
}

export interface OperatorApplicationCreatedInterface {
  application: ApplicationInterface;
  token: string;
}
