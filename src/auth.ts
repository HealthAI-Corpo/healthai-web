import NextAuth from "next-auth";
import Zitadel from "next-auth/providers/zitadel";

// Claim Zitadel contenant les rôles du projet (nécessite
// "Assert Roles on Authentication" coché dans la console Zitadel)
const ZITADEL_ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

export type UserRole = "admin" | "user";

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

function extractRole(profile: Record<string, unknown>): UserRole {
  const roles = profile[ZITADEL_ROLES_CLAIM];
  if (roles && typeof roles === "object" && "admin" in roles) {
    return "admin";
  }
  return "user";
}

// Provisioning JIT : garantit que l'utilisateur connecté existe dans la
// BDD métier. Idempotent côté API — un échec ne bloque pas le login,
// le sync sera rejoué au prochain sign-in.
async function syncUtilisateur(accessToken: string): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_NESTJS_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${baseUrl}/utilisateurs/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error(`Sync utilisateur échoué: HTTP ${res.status}`);
    }
  } catch (error) {
    console.error("Sync utilisateur injoignable:", error);
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
