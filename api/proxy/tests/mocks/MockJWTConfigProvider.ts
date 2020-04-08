import { get } from 'lodash';
import { ConfigInterface } from '@ilos/common';

export class MockJWTConfigProvider implements ConfigInterface {
  get(key: string, fallback?: any): any {
    return get(
      {
        jwt: {
          secret: process.env.APP_JWT_SECRET,
          ttl: -1,
          alg: 'HS256',
          signOptions: {},
          verifyOptions: {},
        },
      },
      key,
      fallback,
    );
  }
}
