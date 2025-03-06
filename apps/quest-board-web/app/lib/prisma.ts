import { prisma } from "@quest-board/database";

const globalForPrisma = globalThis as unknown as {
  prisma: typeof prisma | undefined;
};

export { prisma };

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 