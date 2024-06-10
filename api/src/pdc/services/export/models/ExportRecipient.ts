export class ExportRecipient {
  public _id: number;
  public export_id: number;
  public email: string;
  public fullname: string;
  public message: string;
  public scrambled_at: Date | null;

  public static parseEmail(
    data: string,
  ): { fullname: string | null; email: string } {
    if (data.includes("<") && data.includes(">")) {
      const matches = data.match(/(.*)<(.*)>/);
      if (matches) {
        return { fullname: matches[1].trim(), email: matches[2] };
      }
    }

    return { fullname: null, email: data };
  }

  public static fromEmail(data: string): ExportRecipient {
    const { fullname, email } = ExportRecipient.parseEmail(data);
    const recipient = new ExportRecipient();
    recipient.email = email;
    recipient.fullname = fullname || "";
    return recipient;
  }

  public static fromJSON(data: any): ExportRecipient {
    const recipient = new ExportRecipient();
    recipient._id = data._id;
    recipient.export_id = data.export_id;
    recipient.email = data.email;
    recipient.fullname = data.fullname;
    recipient.message = data.message;
    recipient.scrambled_at = data.scrambled_at;
    return recipient;
  }

  public static toJSON(recipient: ExportRecipient): any {
    return {
      _id: recipient._id,
      export_id: recipient.export_id,
      email: recipient.email,
      fullname: recipient.fullname,
      message: recipient.message,
      scrambled_at: recipient.scrambled_at,
    };
  }
}
