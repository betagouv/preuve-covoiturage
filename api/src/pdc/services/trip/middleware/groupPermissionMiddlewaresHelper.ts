import { ListOfConfiguredMiddlewares } from "@/pdc/providers/middleware/index.ts";
import {
  scopeToGroupMiddleware,
  ScopeToGroupMiddlewareParams,
} from "./ScopeToGroupMiddleware.ts";

export function groupPermissionMiddlewaresHelper(groups: {
  territory: string;
  operator: string;
  registry: string;
}): ListOfConfiguredMiddlewares<ScopeToGroupMiddlewareParams> {
  return [scopeToGroupMiddleware(groups)];
}
