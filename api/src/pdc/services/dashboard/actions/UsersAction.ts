import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryProviderInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/users/users.contract.ts";
import { alias } from "../contracts/users/users.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class UsersAction extends AbstractAction {
  constructor(private repository: UsersRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getUsers(params);
  }
}
