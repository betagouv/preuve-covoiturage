import { InputBase } from './inputBase';

export class InputGroup<T> {
  inputs: InputBase<any>[];
  inputGroup: boolean;
  title: string;
  key: string;


  constructor(options: {
    inputs?: InputBase<any>[],
    inputGroup?: boolean,
    title?: string,
    key?: string,
  } = {}) {
    this.inputs = options.inputs || [];
    this.inputGroup = options.inputGroup;
    this.title = options.title || '';
    this.key = options.key || '';
  }
}
