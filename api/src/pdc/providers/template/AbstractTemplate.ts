import { TemplateInterface } from './interfaces/index.ts';

export abstract class AbstractTemplate<Data = any> implements TemplateInterface<Data> {
  static readonly template: string;

  constructor(public readonly data: Data) {}
}
