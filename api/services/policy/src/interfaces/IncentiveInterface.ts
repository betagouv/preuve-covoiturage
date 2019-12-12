export interface IncentiveInterface {
  policy_id: number;
  carpool_id: number;
  identity_uuid?: string;
  amount: number;
  detail?: { [k: string]: any };
  status?: string;
}
