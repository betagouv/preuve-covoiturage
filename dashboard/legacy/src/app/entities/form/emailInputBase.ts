import { InputBase } from './inputBase';

export class EmailInputBase extends InputBase<string> {
  controlType = 'email';

  constructor(options: {} = {}) {
    super(options);
  }
}
