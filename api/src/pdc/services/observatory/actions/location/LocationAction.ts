import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { Location } from "@/pdc/services/observatory/dto/Location.ts";
import { LocationRepositoryInterfaceResolver } from "../../interfaces/LocationRepositoryProviderInterface.ts";
export type ResultInterface = {
  hex: string;
  count: number;
}[];

@handler({
  service: "observatory",
  method: "getLocation",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    Location,
  ]],
  apiRoute: {
    path: "/observatory/location",
    action: "observatory:getLocation",
    method: "GET",
    actionContextFn: async (req) => {
      return {
        channel: {
          service: "proxy",
          transport: "http",
        },
        call: {
          user: {
            permissions: ["common.observatory.stats"],
          },
          api_version_range: "v3",
        },
      } as ContextType;
    },
  },
})
export class LocationAction extends AbstractAction {
  constructor(private repository: LocationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Location): Promise<ResultInterface> {
    return this.repository.getLocation(params);
  }
}
