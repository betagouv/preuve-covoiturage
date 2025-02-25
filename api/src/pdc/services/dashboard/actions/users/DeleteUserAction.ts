import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { DeleteUser } from "@/pdc/services/dashboard/dto/Users.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "deleteUser",
  middlewares: [
    ["validate", DeleteUser],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.user.delete",
      territory: "territory.user.delete",
      operator: "operator.user.delete",
    }),
  ],
  apiRoute: {
    path: "/dashboard/user/:id",
    action: "dashboard:deleteUser",
    method: "DELETE",
  },
})
export class DeleteUserAction extends AbstractAction {
  constructor(private repository: UsersRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: DeleteUser): Promise<ResultInterface> {
    return this.repository.deleteUser(params);
  }
}
