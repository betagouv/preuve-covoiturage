interface ContactType {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface ContactsInterface {
  gdpr_dpo?: ContactType;
  gdpr_controller?: ContactType;
  technical?: ContactType;
}
