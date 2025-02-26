import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { CreateUser } from "@/pdc/services/dashboard/dto/Users.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "createUser",
  middlewares: [
    ["validate", CreateUser],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.user.create",
      territory: "territory.user.create",
      operator: "operator.user.create",
    }),
  ],
  apiRoute: {
    path: "/dashboard/user",
    action: "dashboard:createUser",
    method: "POST",
  },
})
export class CreateUserAction extends AbstractAction {
  constructor(private repository: UsersRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(data: CreateUser): Promise<ResultInterface> {
    return this.repository.createUser(data);
  }
}
