import { NextAuthOptions } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

interface CustomUser extends AdapterUser {
  displayName: string;
  isProjectManager: boolean;
  isTeamMember: boolean;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      displayName: string;
      isProjectManager: boolean;
      isTeamMember: boolean;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    displayName: string;
    isProjectManager: boolean;
    isTeamMember: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        }) as CustomUser | null;

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isProjectManager: user.isProjectManager,
          isTeamMember: user.isTeamMember,
          emailVerified: user.emailVerified
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'displayName' in user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.displayName = customUser.displayName;
        token.isProjectManager = customUser.isProjectManager;
        token.isTeamMember = customUser.isTeamMember;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.displayName = token.displayName;
        session.user.isProjectManager = token.isProjectManager;
        session.user.isTeamMember = token.isTeamMember;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login'
  }
}; 