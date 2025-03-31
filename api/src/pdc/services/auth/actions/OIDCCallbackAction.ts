import { ConfigInterfaceResolver, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { OIDCCallback } from "../dto/OIDCCallback.ts";
import { OIDCProvider } from "../providers/OIDCProvider.ts";
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
  method: "OIDCCallback",
  middlewares: [
    ["validate", OIDCCallback],
  ],
})
export class OIDCCallbackAction extends AbstractAction {
  constructor(
    private oidcProvider: OIDCProvider,
    private userRepository: UserRepository,
    protected config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public override async handle(params: OIDCCallback): Promise<ResultInterface> {
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
