import { CompetitionType, PrismaClient } from '@prisma/client';
import { encryptPassword } from '../utils/encryption';

const prisma = new PrismaClient();

async function main() {
  // Users
  const syntyche = await prisma.user.upsert({
    where: { email: 'syntyche@gmail.com' },
    update: {},
    create: {
      name: 'Syntyche Joann',
      email: 'syntyche@gmail.com',
      password: await encryptPassword('syntychejoann'),
      role: 'ADMIN',
    },
  });

  const taqqiq = await prisma.user.upsert({
    where: { email: 'taqqiq@gmail.com' },
    update: {},
    create: {
      name: 'Taqqiq Berlin',
      email: 'taqqiq@gmail.com',
      password: await encryptPassword('taqqiqberlin'),
      role: 'USER',
    },
  });

  const rosalinda = await prisma.user.upsert({
    where: { email: 'rosalinda@gmail.com' },
    update: {},
    create: {
      name: 'Rosalinda Astrid',
      email: 'rosalinda@gmail.com',
      password: await encryptPassword('rosalindaastrid'),
      role: 'USER',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@gmail.com' },
    update: {},
    create: {
      name: 'John Astrid',
      email: 'john@gmail.com',
      password: await encryptPassword('johnastrid'),
      role: 'USER',
    },
  });

  const richard = await prisma.user.upsert({
    where: { email: 'richard@gmail.com' },
    update: {},
    create: {
      name: 'Richard Astrid',
      email: 'richard@gmail.com',
      password: await encryptPassword('richardastrid'),
      role: 'ADMIN',
    },
  });

  const roberto = await prisma.user.upsert({
    where: { email: 'roberto@gmail.com' },
    update: {},
    create: {
      name: 'Roberto Alfredo',
      email: 'roberto@gmail.com',
      password: await encryptPassword('robertoalfredo'),
      role: 'USER',
    },
  });

  const james = await prisma.user.upsert({
    where: { email: 'james@gmail.com' },
    update: {},
    create: {
      name: 'James Williams',
      email: 'james@gmail.com',
      password: await encryptPassword('jameswilliams'),
      role: 'USER',
    },
  });

  // Countries
  const brazil = await prisma.country.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Brazil',
      code: 'BR',
      flagUrl: 'image.jpg',
    },
  });

  const spain = await prisma.country.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Spain',
      code: 'ES',
      flagUrl: 'image.jpg',
    },
  });

  const unitedStates = await prisma.country.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'United States of America',
      code: 'US',
      flagUrl: 'image.jpg',
    },
  });

  const uruguay = await prisma.country.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Uruguay',
      code: 'UY',
      flagUrl: 'image.jpg',
    },
  });

  // Positions
  const goalkeeper = await prisma.position.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Goalkeeper',
    },
  });

  const leftWinger = await prisma.position.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Left Winger',
    },
  });

  const rightWinger = await prisma.position.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Right Winger',
    },
  });

  const centreForward = await prisma.position.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Centre Forward',
    },
  });

  // Competitions
  const bfCup = await prisma.competition.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'BF Cup',
      code: 'BF',
      logoUrl: 'comp.jpg',
      type: CompetitionType.CUP,
    },
  });

  const englishLeague = await prisma.competition.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'English League',
      code: 'EL',
      logoUrl: 'comp.jpg',
      type: CompetitionType.LEAGUE,
    },
  });

  const spanishCup = await prisma.competition.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Spanish Cup',
      code: 'ES',
      logoUrl: 'comp.jpg',
      type: CompetitionType.CUP,
    },
  });

  const patskiLeague = await prisma.competition.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Patski League',
      code: 'PA',
      logoUrl: 'comp.jpg',
      type: CompetitionType.LEAGUE,
    },
  });
}

await main()
  .then(async () => await prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
  });
