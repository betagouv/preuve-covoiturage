export interface ApplicationInterface {
  _id?: number;
  uuid: string;
  owner_id: string; // TODO fix to convert to number
  owner_service: string;
  name: string;
  permissions: string[];
  created_at: Date;
  deleted_at?: Date;
}
