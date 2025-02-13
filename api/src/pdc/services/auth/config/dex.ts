import { env_or_fail, env_or_int } from "@/lib/env/index.ts";

export const grpc_host = env_or_fail("DEX_GRPC_HOST");
export const grpc_port = env_or_int("DEX_GRPC_PORT", 5557);
