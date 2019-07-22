export class CGU {
  public accepted?: boolean;
  public acceptedAt?: string;
  public acceptedBy?: string;

  constructor(
    obj: {
      accepted?: boolean;
      acceptedAt?: string;
      acceptedBy?: string;
    } = {},
  ) {
    this.accepted = 'accepted' in obj ? obj.accepted : null;
    this.acceptedAt = obj.acceptedAt || null;
    this.acceptedBy = obj.acceptedBy || null;
  }
}
