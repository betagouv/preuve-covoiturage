import NextAuth, { AuthOptions } from "next-auth";
const options: AuthOptions = {
  providers: [],
};
const handler = NextAuth(options);

export { handler as GET, handler as POST };
