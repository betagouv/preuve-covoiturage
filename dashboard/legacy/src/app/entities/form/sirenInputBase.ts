import { InputBase } from './inputBase';

export class SirenInputBase extends InputBase<string> {
  controlType = 'textbox';
  pattern = '^[0-9]{9}$';

  constructor(options: {} = {}) {
    super(options);
  }
}
