import { prisma } from "@quest-board/database";
import type { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export { prisma }; 