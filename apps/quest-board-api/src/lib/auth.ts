import type { DefaultSession, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@quest-board/database";
import { verify } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

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

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-scroll') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarId: true,
        isProjectManager: true,
        isTeamMember: true,
        skills: true,
        favoriteSkills: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
} 