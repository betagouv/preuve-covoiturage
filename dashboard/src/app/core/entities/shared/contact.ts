export class Contact {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;

  constructor(obj: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  }) {
    this.firstname = obj.firstname;
    this.lastname = obj.lastname;
    this.email = obj.email;
    this.phone = obj.phone;
  }
}
