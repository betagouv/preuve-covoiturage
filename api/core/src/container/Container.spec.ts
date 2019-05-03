import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';

import { Container, handler, lib } from '../Container';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Container', () => {
  it('works', async () => {
    @lib()
    class Hello {
      public world = '!!';
    }

    @handler({
      service: 'test',
      method: 'hello',
    })
    class Test {
      public readonly middlewares: MiddlewareInterface[] = [];
      constructor(public hello: Hello) {}
      async call(call: CallType) {
        return;
      }
    }

    const container = new Container();
    const t = container.resolve(Test);
    expect(t.hello.world).to.equal('!!');

    container.setHandler(Test);

    const tbis = <Test>container.getHandler({
      service: 'test',
      method: 'hello',
    });
    expect(tbis.hello.world).to.equal('!!');
  });
});
