import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const adapter = new PrismaPg({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

function createMissingDbProxy(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new Error('DATABASE_URL environment variable is not set');
    },
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolvePrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (!process.env.DATABASE_URL) {
    return createMissingDbProxy();
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = resolvePrismaClient();
