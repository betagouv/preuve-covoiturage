export class EditResponse {
  public confirm: boolean;
  public value: any;
  public newValue: any;


  constructor(obj?: any) {
    this.confirm = obj && obj.confirm || null;
    this.value = obj && obj.value || null;
    this.newValue = obj && obj.newValue || null;
  }
}

