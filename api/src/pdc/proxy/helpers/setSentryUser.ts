import { Request } from "dep:express";

import { get, pick } from "@/lib/object/index.ts";

import { Sentry } from "@/pdc/providers/sentry/index.ts";
export function setSentryUser(req: Request) {
  const user = get(req, "session.user", {});
  Sentry.setUser(
    pick(user, [
      "_id",
      "application_id",
      "operator_id",
      "territory_id",
      "permissions",
      "role",
      "status",
    ]),
  );
}
