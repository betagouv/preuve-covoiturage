export interface UserForgottenInterface {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  status: string;
  forgotten_at: Date;
  forgotten_token: string;
}
