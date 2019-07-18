
export class CGU {
  public accepted?: boolean;
  public acceptedAt?: string;
  public acceptedBy?: string;

  constructor(obj?: {
    accepted?: boolean;
    acceptedAt?: string;
    acceptedBy?: string;
  }) {
    this.accepted = obj.accepted;
    this.acceptedAt = obj.acceptedAt;
    this.acceptedBy = obj.acceptedBy;
  }
}
