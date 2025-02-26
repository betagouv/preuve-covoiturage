import { ClientInitOptions, getClient } from "dep:grpc";
import { Dex } from "./generated/api.ts";

export async function getDexClient(
  config: {
    host: string;
    port: number;
  } & Partial<ClientInitOptions>,
) {
  const protoPath = new URL("./protofiles/api.proto", import.meta.url);
  const protoFile = await Deno.readTextFile(protoPath);
  // Create a gRPC client
  const client = getClient<Dex>({
    root: protoFile,
    serviceName: "Dex",
    ...config,
  });
  return client;
}
