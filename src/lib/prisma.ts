import './db-config';
import { PrismaClient as PrismaClientIndia } from '../../prisma/generated/india';
import { PrismaClient as PrismaClientUSA } from '../../prisma/generated/usa';

// Prisma Client for India database
export const prismaIndia = new PrismaClientIndia({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Prisma Client for USA database
export const prismaUSA = new PrismaClientUSA({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Global function to disconnect both clients
export async function disconnectPrisma() {
  await prismaIndia.$disconnect();
  await prismaUSA.$disconnect();
}

// Prevent multiple instances in development
declare global {
  var prismaIndia: PrismaClientIndia | undefined;
  var prismaUSA: PrismaClientUSA | undefined;
}

if (process.env.NODE_ENV !== 'production') {
  global.prismaIndia = prismaIndia;
  global.prismaUSA = prismaUSA;
}

