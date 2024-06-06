import { ServiceProvider as AbstractServiceProvider } from '@/ilos/core/index.ts';
import { serviceProvider, NewableType, ExtensionInterface } from '@/ilos/common/index.ts';
import { defaultMiddlewareBindings } from '@/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '@/pdc/providers/validator/index.ts';
import { GeoProvider } from '@/pdc/providers/geo/index.ts';
import { config } from './config/index.ts';

import { binding as getPointByCodeBinding } from '@/shared/geo/getPointByCode.schema.ts';
import { binding as getPointByAddressBinding } from '@/shared/geo/getPointByAddress.schema.ts';
import { binding as getRouteMeta } from '@/shared/geo/getRouteMeta.schema.ts';

import { GetPointByAddressAction } from './actions/GetPointByAddressAction.ts';
import { GetPointByCodeAction } from './actions/GetPointByCodeAction.ts';
import { GetRouteMetaAction } from './actions/GetRouteMetaAction.ts';

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
