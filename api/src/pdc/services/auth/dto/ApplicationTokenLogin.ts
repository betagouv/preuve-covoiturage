import { Infer, object, string } from "@/lib/superstruct/index.ts";

export const ApplicationTokenLogin = object({
  access_key: string(),
  secret_key: string(),
});

export type ApplicationTokenLogin = Infer<typeof ApplicationTokenLogin>;
