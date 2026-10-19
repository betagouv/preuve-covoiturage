import { ContextType, ForbiddenException, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { SessionRepository } from "@/pdc/services/auth/providers/SessionRepository.ts";
import { DeleteUser } from "@/pdc/services/dashboard/dto/Users.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryInterface.ts";
const log = taggedLogger("[session]");

export type ResultInterface = {
  success: boolean;
  message: string;
  outcome: "user_deleted" | "scope_released";
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
  constructor(
    private repository: UsersRepositoryInterfaceResolver,
    private sessionRepository: SessionRepository,
  ) {
    super();
  }

  public override async handle(params: DeleteUser, context: ContextType): Promise<ResultInterface> {
    if (context?.call?.user?._id === params.id) {
      throw new ForbiddenException("Suppression de son propre compte interdite");
    }

    const result = await this.repository.deleteUser(params);
    // Purge aussi sur retrait de périmètre : sinon la session en cours garde le territoire révoqué.
    // Redis en échec ne doit pas faire répondre 500 à une suppression déjà effectuée.
    try {
      await this.sessionRepository.destroyByUser(params.id);
    } catch (e) {
      log.error("purge failed", { user_id: params.id, error: errorCode(e) });
    }
    return result;
  }
}
