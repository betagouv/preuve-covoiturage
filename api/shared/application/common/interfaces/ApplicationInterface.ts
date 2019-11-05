export interface ApplicationInterface {
  _id?: string;
  owner_id: string;
  owner_service: string;
  name: string;
  permissions: string[];
  created_at: Date;
  deleted_at?: Date;
}
