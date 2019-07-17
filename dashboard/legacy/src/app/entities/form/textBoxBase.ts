import { InputBase } from './inputBase';

export class TextboxBase extends InputBase<string> {
  controlType = 'textbox';
  public type: string;
  public pattern: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
    this.pattern = options['pattern'] || '';
  }
}
