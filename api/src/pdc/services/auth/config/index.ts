import * as oidc from "./oidc.ts";
import * as oldjwt from "./old_jwt.ts";
import * as permissions from "./permissions.ts";

export const config = {
  permissions,
  oidc,
  jwt: oldjwt,
};
