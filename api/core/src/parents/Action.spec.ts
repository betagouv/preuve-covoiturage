// tslint:disable no-shadowed-variable max-classes-per-file
import { describe } from 'mocha';
import { expect, assert } from 'chai';

import { Action } from './Action';
import { CallType } from '../types/CallType';

describe('Action', () => {
  it('should work', () => {
    class BasicAction extends Action {
      protected handle(call: CallType):void {
        let count = 0;
        if ('add' in call.parameters) {
          const { add } = call.parameters;
          add.forEach((param) => {
            count += param;
          });
        }
        call.result.result = count;
        return;
      }
    }
    const action = new BasicAction();
    const result = {
      result: 0,
    };
    action.call({
      result,
      method: '',
      context: {
        internal: true,
      },
      parameters: {
        add: [1, 1],
      },
    });
    expect(result.result).equal(2);
  });

  it('should work with middleware', () => {
    class BasicAction extends Action {
      protected middlewares = [(call: CallType, next: Function) => {
        call.result.result = -1;
        next();
      }];
      protected handle(call: CallType):void {
        let { result:count } = call.result;
        if ('add' in call.parameters) {
          const { add } = call.parameters;
          add.forEach((param) => {
            count += param;
          });
        }
        call.result.result = count;
        return;
      }
    }
    const action = new BasicAction();
    const result = {
      result: 0,
    };
    action.call({
      result,
      method: '',
      context: {
        internal: true,
      },
      parameters: {
        add: [1, 1],
      },
    });
    expect(result.result).equal(1);
  });

  it('should work with ordered middleware', () => {
    class BasicAction extends Action {
      protected middlewares = [(call: CallType, next: Function) => {
        call.result.result += 'hello ';
        next();
        call.result.result += '?';
      }, (call: CallType, next: Function) => {
        call.result.result += 'world ';
        next();
        call.result.result += '!';
      }];
      protected handle(call: CallType):void {
        const { result } = call.result;
        if ('name' in call.parameters) {
          call.result.result += call.parameters.name;
        }
        return;
      }
    }
    const action = new BasicAction();
    const result = {
      result: '',
    };
    action.call({
      result,
      method: '',
      context: {
        internal: true,
      },
      parameters: {
        name: 'Sam',
      },
    });
    expect(result.result).equal('hello world Sam!?');
  });

  it('should raise an error if no handle method is defined', () => {
    class BasicAction extends Action {}
    const action = new BasicAction();
    assert.throw(
      () => action.call({
        result: {},
        method: '',
        context: {
          internal: true,
        },
        parameters: {
          name: 'Sam',
        },
      }),
      Error,
      'No implementation found',
      );
  });
});
