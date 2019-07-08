export interface ApplicationInterface {
  _id: string;
  name: string;
  permissions: string[];
  created_at: Date;
  deleted_at?: Date;
}
