import { describe } from 'mocha';
import chai from 'chai';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { ConfigInterfaceResolver, ValidatorInterfaceResolver } from '@ilos/common';
import { AjvValidator } from '@ilos/validator';

import chaiAsPromised from 'chai-as-promised';

import { NormalizationProcessAction } from './NormalizationProcessAction';

import { irtSystemXTestCoupleMatching as testCouple } from '../tests/IRTSystemXTestData';

import {
  ParamsInterface as CostParamsInterface,
  ResultInterface as CostResultInterface,
} from '../shared/normalization/cost.contract';
import {
  ParamsInterface as IdentityParamsInterface,
  ResultInterface as IdentityResultInterface,
} from '../shared/normalization/identity.contract';
import {
  ParamsInterface as GeoParamsInterface,
  ResultInterface as GeoResultInterface,
} from '../shared/normalization/geo.contract';
import {
  ParamsInterface as RouteParamsInterface,
  ResultInterface as RouteResultInterface,
} from '../shared/normalization/route.contract';
import {
  ParamsInterface as TerritoryParamsInterface,
  ResultInterface as TerritoryResultInterface,
} from '../shared/normalization/territory.contract';
import { signature as crossCheckSignature } from '../shared/carpool/crosscheck.contract';
import { schema as crosscheckSchema } from '../shared/carpool/crosscheck.schema';

chai.use(chaiAsPromised);

describe('Normalization process action', () => {
  class Config extends ConfigInterfaceResolver {
    get(k: string, fb: any): any {
      return fb;
    }
  }

  const validator: ValidatorInterfaceResolver = new AjvValidator(new Config());

  validator.boot();

  validator.registerValidator(crosscheckSchema, 'crosscheck_schema');

  const { expect } = chai;

  type ContextType = {
    channel: {
      service: string;
      transport?: string;
      metadata?: any;
    };
    call?: {
      user: any;
      metadata?: any;
    };
  };

  const normalizationHandler = {
    geo(params: GeoParamsInterface): GeoResultInterface {
      return {
        start: {
          lat: 0.0001,
          lon: 0.0002,
          insee: '000 833 048',
        },

        end: {
          lat: 0.0003,
          lon: 0.0004,
          insee: '001 833 048',
        },
      };
    },
    cost(params: CostParamsInterface): CostResultInterface {
      return {
        cost: 200,
        payments: [],
      };
    },
    identity(params: IdentityParamsInterface): IdentityResultInterface {
      return {
        phone: '0101010100',
        phone_trunc: '00000000XX',
        operator_user_id: '10',

        firstname: 'Jean Michel',
        lastname: 'Delamotte',
        email: 'jeanmicj@mott.com',
        company: 'momotte corps',

        travel_pass_name: '00011',
        travel_pass_user_id: '1',

        over_18: true,
      };
    },
    route(params: RouteParamsInterface): RouteResultInterface {
      return {
        calc_distance: 40,
        calc_duration: 30,
      };
    },
    territory(params: TerritoryParamsInterface): TerritoryResultInterface {
      return {
        start: 10,
        end: 20,
      };
    },
  };

  class Kernel extends AbstractKernel {
    constructor() {
      super();
    }
    async call<P, R>(method: string, params: P, context: ContextType): Promise<R> {
      const methodName = method.split(':').pop();

      if (normalizationHandler.hasOwnProperty(methodName)) {
        return normalizationHandler[methodName](params);
      }

      if (method === crossCheckSignature) {
        // throw new Error();
        await validator.validate(params, 'crosscheck_schema');
        return null;
      }

      throw new Error(`Kernel call not supported ${method}`);

      return null;
    }
  }

  it('NormalizationProcessAction should handle imput data and result cross check params data', async () => {
    const action = new NormalizationProcessAction(new Kernel());
    console.log('testCouple', JSON.stringify(testCouple));
    // console.log('driver', driver);
    // console.log('passenger', passenger);
    // console.log('differentDriver', differentDriver);
    const result = action.handle(testCouple);

    // @ts-ignore
    return expect(result).to.not.be.rejected;
  });
});
