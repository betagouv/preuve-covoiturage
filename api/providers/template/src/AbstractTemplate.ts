import { TemplateInterface } from './interfaces';

export abstract class AbstractTemplate<Data = any> implements TemplateInterface<Data> {
    static readonly template: string;
  
    constructor(
        public readonly data: Data,
    ) {}
}
