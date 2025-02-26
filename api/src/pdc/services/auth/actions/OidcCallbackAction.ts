import { ConfigInterfaceResolver, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { OidcCallback } from "../dto/OidcCallback.ts";
import { OidcProvider } from "../providers/OidcProvider.ts";
import { UserRepository } from "../providers/UserRepository.ts";

export type ResultInterface = {
  email: string;
  role: string;
  permissions: Array<string>;
  operator_id?: number;
  territory_id?: number;
};

@handler({
  service: "auth",
  method: "oidcCallback",
  middlewares: [
    ["validate", OidcCallback],
  ],
})
export class OidcCallbackAction extends AbstractAction {
  constructor(
    private oidcProvider: OidcProvider,
    private userRepository: UserRepository,
    protected config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: OidcCallback): Promise<ResultInterface> {
    const token = await this.oidcProvider.getTokenFromCode(params.code);
    const info = await this.oidcProvider.getUserInfoFromToken(token);
    const user = await this.userRepository.findUserByEmail(info.email);
    if (!user || (user.siret !== info.siret && user.role !== "registry.admin")) {
      return {
        email: info.email,
        role: "anonymous",
        permissions: [],
      };
    }
    return {
      ...user,
      permissions: this.getPermissionsFromRole(user.role),
    };
  }

  private getPermissionsFromRole(role: string): string[] {
    return this.config.get(`permissions.${role}.permissions`, []);
  }
}
