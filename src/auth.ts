import NextAuth from "next-auth";
import Zitadel from "next-auth/providers/zitadel";

// Augmentation des types next-auth pour exposer l'access_token ZITADEL
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      issuer: process.env.ZITADEL_ISSUER!,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, account }) {
      // Stocke l'access_token ZITADEL dans le JWT next-auth (côté serveur)
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      // Expose l'access_token dans la session côté client
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});
