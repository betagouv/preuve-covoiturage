export interface ApplicationInterface {
  _id?: string;
  name: string;
  operator_id: string;
  permissions: string[];
  createdAt: Date;
  deletedAt?: Date;
}
