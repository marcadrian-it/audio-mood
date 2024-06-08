import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL environment variable is not set");
}

if (!TURSO_AUTH_TOKEN && process.env.NODE_ENV === "production") {
  throw new Error("TURSO_AUTH_TOKEN environment variable is not set");
}

const libsqlOptions = {
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
};

const libsql = createClient(libsqlOptions);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaLibSQL(libsql);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
