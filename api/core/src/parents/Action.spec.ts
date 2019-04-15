import { describe } from 'mocha';
import { expect } from 'chai';

import { Action } from './Action';
import { CallInterface } from '../interfaces/CallInterface';

describe('Action', () => {
  it('should work', () => {
    class BasicAction extends Action {
      protected handle(call: CallInterface):void {
        let result = 0;
        if ('add' in call.parameters) {
            const { add } = call.parameters;
            add.forEach(param => {
                result += param;
              });
        }
        call.result.result = result;
        return;
      }
    }
    const action = new BasicAction;
    const result = {
        result: 0,
    };
    action.cast({
        method: '',
        context: {
          internal: true
        },
        parameters: {
            add: [1, 1],
        },
        result,
      });
    expect(result.result).equal(2);
  });

  it('should work with middleware', () => {
    class BasicAction extends Action {
      protected middlewares = [(call: CallInterface, next: Function) => {
        call.result.result = -1;
        next();
      }];
      protected handle(call: CallInterface):void {
        let { result } = call.result;
        if ('add' in call.parameters) {
            const { add } = call.parameters;
            add.forEach(param => {
                result += param;
              });
        }
        call.result.result = result;
        return;
      }
    }
    const action = new BasicAction;
    const result = {
        result: 0,
    };
    action.cast({
        method: '',
        context: {
          internal: true
        },
        parameters: {
            add: [1, 1],
        },
        result,
      });
    expect(result.result).equal(1);
  });

  it('should work with ordered middleware', () => {
    class BasicAction extends Action {
      protected middlewares = [(call: CallInterface, next: Function) => {
        call.result.result += "hello ";
        next();
        call.result.result += "?";
      }, (call: CallInterface, next: Function) => {
        call.result.result += "world ";
        next();
        call.result.result += "!";
      }];
      protected handle(call: CallInterface):void {
        let { result } = call.result;
        call.result.result += call.parameters.name;
        return;
      }
    }
    const action = new BasicAction;
    const result = {
        result: '',
    };
    action.cast({
        method: '',
        context: {
          internal: true
        },
        parameters: {
            name: "Sam",
        },
        result,
      });
    expect(result.result).equal("hello world Sam!?");
  });
});
