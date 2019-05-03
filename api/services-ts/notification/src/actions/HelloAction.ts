import { Action, handler } from '@pdc/core';

@handler({
  service: 'notification',
  method: 'hello',
})
export class HelloAction extends Action {
  public readonly middlewares = [];

  protected async handle(params) {
    const name = (params && 'name' in params) ? params.name : 'John Doe';
    return `Hello ${name}`;
  }
}
