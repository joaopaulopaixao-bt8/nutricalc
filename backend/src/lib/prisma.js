const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__nutricalcPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__nutricalcPrisma = prisma;
}

module.exports = prisma;
