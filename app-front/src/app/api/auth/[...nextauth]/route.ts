import { Config } from "@/config";
import NextAuth, { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const options: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: Config.get<string>("auth.keycloak_id"),
      clientSecret: Config.get<string>("auth.keycloak_secret"),
      issuer: Config.get<string>("auth.keycloak_issuer"),
    }),
  ],
};
const handler = NextAuth(options);

export { handler as GET, handler as POST };
