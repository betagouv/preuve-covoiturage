import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { GeoProvider } from '@pdc/providers/geo';
import { config } from './config';

import { binding as getPointByCodeBinding } from '@shared/geo/getPointByCode.schema';
import { binding as getPointByAddressBinding } from '@shared/geo/getPointByAddress.schema';
import { binding as getRouteMeta } from '@shared/geo/getRouteMeta.schema';

import { GetPointByAddressAction } from './actions/GetPointByAddressAction';
import { GetPointByCodeAction } from './actions/GetPointByCodeAction';
import { GetRouteMetaAction } from './actions/GetRouteMetaAction';

@serviceProvider({
  config,
  providers: [GeoProvider],
  validator: [getPointByAddressBinding, getPointByCodeBinding, getRouteMeta],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  handlers: [GetPointByAddressAction, GetPointByCodeAction, GetRouteMetaAction],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
