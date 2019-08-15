export class Contact {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;

  constructor(obj: { firstname: string; lastname: string; email: string; phone?: string }) {
    this.firstname = obj && obj.firstname;
    this.lastname = obj && obj.lastname;
    this.email = obj && obj.email;
    this.phone = (obj && obj.phone) || null;
  }
}
