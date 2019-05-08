import { InputBase } from './inputBase';

export class PasswordInputBase extends InputBase<string> {
  controlType = 'password';

  constructor(options: {} = {}) {
    super(options);
  }
}
