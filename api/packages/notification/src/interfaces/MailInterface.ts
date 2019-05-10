export interface MailInterface {
  email: string;
  fullname: string;
  subject: string;
  content: {
    title: string,
    content: string,
  };
}
