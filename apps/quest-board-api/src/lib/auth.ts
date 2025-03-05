import type { DefaultSession, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@quest-board/database";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isProjectManager?: boolean;
      isTeamMember?: boolean;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub!;
        
        const user = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            isProjectManager: true,
            isTeamMember: true,
          },
        });

        if (user) {
          session.user.isProjectManager = user.isProjectManager;
          session.user.isTeamMember = user.isTeamMember;
        }
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
};

export const { auth, signIn, signOut } = NextAuth(authOptions); 