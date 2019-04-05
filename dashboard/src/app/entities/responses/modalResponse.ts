export class ModalResponse {
  public confirm: boolean;
  public value: any;


  constructor(obj?: any) {
    this.confirm = obj && obj.confirm || null;
    this.value = obj && obj.value || null;
  }
}

