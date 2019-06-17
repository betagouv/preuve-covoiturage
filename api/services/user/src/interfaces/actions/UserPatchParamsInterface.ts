export interface UserPatchParamsInterface {
  id: string;
  patch: {
    firstname?: string;
    lastname?: string;
    phone?: string;
  };
}
