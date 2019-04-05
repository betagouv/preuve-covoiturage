import { User } from './user/user';

export class CGU {
  accepted: boolean;
  acceptedAt: string;
  acceptedBy: User;

  constructor(obj?: any) {
    this.accepted = obj && obj.accepted || null;
    this.acceptedAt = obj && obj.acceptedAt || null;
    this.acceptedBy = obj && obj.acceptedBy || null;
  }
}
