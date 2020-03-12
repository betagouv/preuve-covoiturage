export class CGU {
  public accepted?: boolean;
  public acceptedAt?: string;
  public acceptedBy?: string;

  constructor(
    data: {
      accepted?: boolean;
      acceptedAt?: string;
      acceptedBy?: string;
    } = {},
  ) {
    if (data && data.accepted) this.accepted = data.accepted;
    if (data && data.acceptedAt) this.acceptedAt = data.acceptedAt;
    if (data && data.acceptedBy) this.acceptedBy = data.acceptedBy;
  }

  toFormValues(): any {
    return {
      accepted: false,
      acceptedAt: '',
      acceptedBy: '',
      ...this,
    };
  }
}
