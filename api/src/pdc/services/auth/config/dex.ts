import { env_or_fail, env_or_int } from "@/lib/env/index.ts";

export const grpc_host = env_or_fail("DEX_GRPC_HOST");
export const grpc_port = env_or_int("DEX_GRPC_PORT", 5557);

export const client_id = env_or_fail("DEX_CLIENT_ID");
export const client_secret = env_or_fail("DEX_CLIENT_SECRET");
export const base_url = env_or_fail("DEX_BASE_URL");
