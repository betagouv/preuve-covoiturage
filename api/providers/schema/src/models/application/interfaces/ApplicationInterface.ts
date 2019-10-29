export interface ApplicationInterface {
  _id?: string;
  name: string;
  operator_id: string;
  permissions: string[];
  created_at: Date;
  deleted_at?: Date;
}
