export class Contact {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;

  constructor(obj: { firstname: string; lastname: string; email: string; phone?: string }) {
    if (obj && obj.firstname) this.firstname = obj.firstname;
    if (obj && obj.lastname) this.lastname = obj.lastname;
    if (obj && obj.email) this.email = obj.email;
    if (obj && obj.phone) this.phone = obj.phone;
  }

  toFormValues() {
    return {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      ...this,
    };
  }
}
