import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { Users } from "@/pdc/services/dashboard/dto/Users.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryProviderInterface.ts";
export type ResultInterface = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  operator_id?: number;
  territory_id?: number;
  phone: string;
  status: string;
  role: string;
}[];

@handler({
  service: "dashboard",
  method: "users",
  middlewares: [
    ["validate", Users],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.user.list",
      territory: "territory.user.list",
      operator: "operator.user.list",
    }),
  ],
})
export class UsersAction extends AbstractAction {
  constructor(private repository: UsersRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Users): Promise<ResultInterface> {
    return this.repository.getUsers(params);
  }
}
