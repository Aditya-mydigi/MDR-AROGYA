import './db-config';
import { PrismaClient as PrismaClientIndia } from '../../prisma/generated/india';
import { PrismaClient as PrismaClientUSA } from '../../prisma/generated/usa';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Expect URLs to be present after db-config runs
const urlIndia = process.env.DATABASE_URL_INDIA;
const urlUSA = process.env.DATABASE_URL_USA;

if (!urlIndia || !urlUSA) {
  throw new Error(
    'Database URLs missing. Check DB_HOST_IN/DB_HOST_US, DB_NAME_IN/DB_NAME (USA), DB_USER and DB_PASSWORD env vars.'
  );
}

// PostgreSQL pools
const poolIndia = new Pool({
  connectionString: urlIndia,
});

const poolUSA = new Pool({
  connectionString: urlUSA,
});

// Prisma adapters
const adapterIndia = new PrismaPg(poolIndia);
const adapterUSA = new PrismaPg(poolUSA);

// Prisma Client for India database
export const prismaIndia =
  global.prismaIndia ??
  new PrismaClientIndia({
    adapter: adapterIndia,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Prisma Client for USA database
export const prismaUSA =
  global.prismaUSA ??
  new PrismaClientUSA({
    adapter: adapterUSA,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Global disconnect helper
export async function disconnectPrisma() {
  await prismaIndia.$disconnect();
  await prismaUSA.$disconnect();
}

// Prevent multiple instances in dev
declare global {
  var prismaIndia: PrismaClientIndia | undefined;
  var prismaUSA: PrismaClientUSA | undefined;
}

if (process.env.NODE_ENV !== 'production') {
  global.prismaIndia = prismaIndia;
  global.prismaUSA = prismaUSA;
}