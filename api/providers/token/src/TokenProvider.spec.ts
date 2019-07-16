// tslint:disable: no-unused-expression

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { JsonWebTokenError } from 'jsonwebtoken';

import { TokenProvider } from './TokenProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const appId = '5d265236c3a9744f81ebef5c';
const operatorId = '5d265241f360e9a1538a0b7d';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjVkMjY1MjM2YzNhOTc0NGY4MWViZWY1YyIsIm9wZXJhdG9ySWQiOiI1ZDI2NTI0MWYzNjBlOWExNTM4YTBiN2QiLCJpYXQiOjE1NjI3OTI3MDd9.VXO7foy2U-GJ1fAUuTwGLE8K2xK5MvF0WADE2GQN214';

describe('TokenProvider', () => {
  it('sign the payload', async () => {
    const tp = new TokenProvider({ secret: 'notsosecret' });
    expect(tp.sign({ appId, operatorId, iat: 1562792707 })).to.eventually.equal(token);
  });

  it('verify the token', async () => {
    const tp = new TokenProvider({ secret: 'notsosecret', ttl: -1 });
    const valid = await tp.verify(token);
    expect(valid).to.have.property('appId', appId);
    expect(valid).to.have.property('operatorId', operatorId);
  });

  it('throws on wrong secret', async () => {
    const badTp = new TokenProvider({ secret: 'wrong-secret' });
    expect(badTp.verify(token)).to.be.rejectedWith(JsonWebTokenError, 'invalid signature');
  });

  it('throws on expired', async () => {
    const tp = new TokenProvider({ secret: 'notsosecret' });
    // tslint:disable-next-line: no-bitwise
    const oldToken = await tp.sign({ appId, operatorId, iat: (new Date(2019, 1, 1).getTime() / 1000) | 0 });
    expect(tp.verify(oldToken)).to.be.rejectedWith(JsonWebTokenError, 'Expired token');
  });

  it('passes on never expire', async () => {
    const tp = new TokenProvider({ secret: 'notsosecret', ttl: -1 });
    // tslint:disable-next-line: no-bitwise
    const oldToken = await tp.sign({ appId, operatorId, iat: (new Date(2019, 1, 1).getTime() / 1000) | 0 });
    expect(tp.verify(oldToken)).to.be.fulfilled;
  });

  // throws on wrong issuer
  // throws on wrong audience
  // throws on wrong alg
  // throws if alg is 'none'

  // TODO
  // - add token check and operatorId / permissions injection in proxy
  // - add Application creation in operator's routes
});
