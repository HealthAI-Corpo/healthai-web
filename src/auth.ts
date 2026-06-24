import NextAuth from "next-auth";
import Zitadel from "next-auth/providers/zitadel";

import {
  extractRole,
  syncUtilisateur,
  type UserRole,
} from "@/lib/auth/helpers";

export type { UserRole };

// Augmentation des types next-auth : access_token ZITADEL + rôle
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
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
    async jwt({ token, account, profile }) {
      // account + profile ne sont présents qu'au sign-in
      if (account?.access_token) {
        token.accessToken = account.access_token;
        await syncUtilisateur(account.access_token);
      }
      if (profile) {
        token.role = extractRole(profile as Record<string, unknown>);
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.user.role = (token.role as UserRole | undefined) ?? "user";
      return session;
    },
  },
});
