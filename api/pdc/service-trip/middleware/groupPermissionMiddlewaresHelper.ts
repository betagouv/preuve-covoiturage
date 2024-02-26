import { ListOfConfiguredMiddlewares } from '@pdc/provider-middleware';
import { scopeToGroupMiddleware, ScopeToGroupMiddlewareParams } from './ScopeToGroupMiddleware';

export function groupPermissionMiddlewaresHelper(groups: {
  territory: string;
  operator: string;
  registry: string;
}): ListOfConfiguredMiddlewares<ScopeToGroupMiddlewareParams> {
  return [scopeToGroupMiddleware(groups)];
}
