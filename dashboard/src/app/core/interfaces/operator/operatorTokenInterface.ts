export interface OperatorTokenInterface {
  _id: string;
  name: string;
  created_at: Date;
}

export interface OperatorTokenCreationInterface {
  application: OperatorTokenInterface;
  token: string;
}
