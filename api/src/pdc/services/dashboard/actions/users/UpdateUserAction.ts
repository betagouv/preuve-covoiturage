import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { UpdateUser } from "@/pdc/services/dashboard/dto/Users.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "updateUser",
  middlewares: [
    ["validate", UpdateUser],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.user.update",
      territory: "territory.user.update",
      operator: "operator.user.update",
    }),
  ],
  apiRoute: {
    path: "/dashboard/user",
    action: "dashboard:updateUser",
    method: "PUT",
  },
})
export class UpdateUserAction extends AbstractAction {
  constructor(private repository: UsersRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(data: UpdateUser): Promise<ResultInterface> {
    return this.repository.updateUser(data);
  }
}
