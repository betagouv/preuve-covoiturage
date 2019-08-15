import { InputBase } from './inputBase';

export class PhoneInputBase extends InputBase<string> {
  controlType = 'phone';

  constructor(options: {} = {}) {
    super(options);
  }
}
