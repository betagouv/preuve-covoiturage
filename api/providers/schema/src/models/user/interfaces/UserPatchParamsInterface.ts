export interface UserPatchParamsInterface {
  _id: string;
  patch: {
    firstname?: string;
    lastname?: string;
    phone?: string;
  };
}
