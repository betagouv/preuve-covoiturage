import { ParamsType, RPCSingleCallType } from "@/ilos/common/index.ts";
import { UserInterface } from "@/shared/user/common/interfaces/UserInterface.ts";
import { injectContext } from "./injectContext.ts";

export function createRPCPayload(
  method: string,
  params: ParamsType,
  user?: Partial<UserInterface>,
  metadata?: any,
): RPCSingleCallType {
  return injectContext(
    {
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    },
    user,
    metadata,
  );
}
