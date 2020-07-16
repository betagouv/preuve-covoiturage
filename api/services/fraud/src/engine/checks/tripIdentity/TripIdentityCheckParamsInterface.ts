export interface SingleTripIdentityCheckParamsInterface {
  phone: string;
  phone_trunc: string;
  operator_id: string;
  operator_user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  travel_pass_name: string;
  travel_pass_user_id: string;
}

export type TripIdentityCheckParamsInterface = SingleTripIdentityCheckParamsInterface[];
