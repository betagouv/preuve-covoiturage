export interface UserPatchParamsInterface {
  _id: string;
  patch: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
  };
}
