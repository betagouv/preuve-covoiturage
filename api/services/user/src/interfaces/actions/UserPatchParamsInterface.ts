export interface UserPatchParamsInterface {
  id: string;
  patch: {
    email?: string;
    lastname?: string;
    firstname?: string;
    phone?: string;
    group?: string;
    role?: string;
    password?: string;
    aom?: string;
    operator?: string;
    newPassword?: string;
    oldPassword?: string;
  };
}
