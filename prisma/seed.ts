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

  // Seasons
  const year1920 = await prisma.season.upsert({
    where: { id: 1 },
    update: {},
    create: {
      year: 1920,
      start: new Date('1920-01-01'),
      end: new Date('1920-12-31'),
      isCurrent: false,
    },
  });

  const year1941 = await prisma.season.upsert({
    where: { id: 2 },
    update: {},
    create: {
      year: 1941,
      start: new Date('1941-01-01'),
      end: new Date('1941-12-31'),
      isCurrent: false,
    },
  });

  const year1980 = await prisma.season.upsert({
    where: { id: 3 },
    update: {},
    create: {
      year: 1980,
      start: new Date('1980-01-01'),
      end: new Date('1980-12-31'),
      isCurrent: false,
    },
  });

  const year2000 = await prisma.season.upsert({
    where: { id: 4 },
    update: {},
    create: {
      year: 2000,
      start: new Date('2000-01-01'),
      end: new Date('2000-12-31'),
      isCurrent: true,
    },
  });

  // Teams
  const teamA = await prisma.team.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Team A',
      code: 'TEA',
      logoUrl: 'logo.jpg',
      foundingDate: new Date('1920-01-01'),
      country: {
        connect: { id: brazil.id },
      },
    },
  });

  const teamB = await prisma.team.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Team B',
      code: 'TEB',
      logoUrl: 'logo.jpg',
      foundingDate: new Date('1920-01-01'),
      country: {
        connect: { id: brazil.id },
      },
    },
  });

  const teamC = await prisma.team.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Team C',
      code: 'TEC',
      logoUrl: 'logo.jpg',
      foundingDate: new Date('1920-01-01'),
      country: {
        connect: { id: brazil.id },
      },
    },
  });

  const teamD = await prisma.team.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Team D',
      code: 'TED',
      logoUrl: 'logo.jpg',
      foundingDate: new Date('1920-01-01'),
      country: {
        connect: { id: brazil.id },
      },
    },
  });

  // Trophies
  const trophyA = await prisma.trophy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      competitionId: 2,
      seasonId: 1,
      teamId: 2,
    },
  });

  const trophyB = await prisma.trophy.upsert({
    where: { id: 2 },
    update: {},
    create: {
      competitionId: 1,
      seasonId: 3,
      teamId: 1,
    },
  });

  const trophyC = await prisma.trophy.upsert({
    where: { id: 3 },
    update: {},
    create: {
      competitionId: 3,
      seasonId: 1,
      teamId: 2,
    },
  });

  const trophyD = await prisma.trophy.upsert({
    where: { id: 4 },
    update: {},
    create: {
      competitionId: 1,
      seasonId: 1,
      teamId: 2,
    },
  });

  // Matches
  const matchA = await prisma.match.upsert({
    where: { id: 1 },
    update: {},
    create: {
      competitionId: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      seasonId: 1,
    },
  });

  const matchB = await prisma.match.upsert({
    where: { id: 2 },
    update: {},
    create: {
      competitionId: 1,
      homeTeamId: 2,
      awayTeamId: 1,
      seasonId: 2,
    },
  });

  const matchC = await prisma.match.upsert({
    where: { id: 3 },
    update: {},
    create: {
      competitionId: 3,
      homeTeamId: 1,
      awayTeamId: 2,
      seasonId: 1,
    },
  });

  const matchD = await prisma.match.upsert({
    where: { id: 4 },
    update: {},
    create: {
      competitionId: 2,
      homeTeamId: 3,
      awayTeamId: 2,
      seasonId: 2,
    },
  });

  // Players
  const playerA = await prisma.player.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Player A',
      dateOfBirth: new Date('1990-01-01'),
      height: 1.8,
      weight: 70,
      countryId: spain.id,
      positionId: goalkeeper.id,
      currentTeamId: teamA.id,
    },
  });

  const playerB = await prisma.player.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Player B',
      dateOfBirth: new Date('1990-01-01'),
      height: 1.8,
      weight: 70,
      countryId: spain.id,
      positionId: goalkeeper.id,
      currentTeamId: teamA.id,
    },
  });

  const playerC = await prisma.player.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Player C',
      dateOfBirth: new Date('1990-01-01'),
      height: 1.8,
      weight: 70,
      countryId: spain.id,
      positionId: goalkeeper.id,
      currentTeamId: teamA.id,
    },
  });

  const playerD = await prisma.player.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Player D',
      dateOfBirth: new Date('1990-01-01'),
      height: 1.8,
      weight: 70,
      countryId: spain.id,
      positionId: goalkeeper.id,
      currentTeamId: teamA.id,
    },
  });

  // Transfers
  const transferA = await prisma.transfer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      date: new Date(),
      fee: 100000,
      playerId: playerA.id,
      previousTeamId: teamA.id,
      newTeamId: teamB.id,
    },
  });

  const transferB = await prisma.transfer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      date: new Date(),
      fee: 60000,
      playerId: playerA.id,
      previousTeamId: teamB.id,
      newTeamId: teamA.id,
    },
  });

  const transferC = await prisma.transfer.upsert({
    where: { id: 3 },
    update: {},
    create: {
      date: new Date(),
      fee: 100000,
      playerId: playerB.id,
      previousTeamId: teamB.id,
      newTeamId: teamA.id,
    },
  });

  const transferD = await prisma.transfer.upsert({
    where: { id: 4 },
    update: {},
    create: {
      date: new Date(),
      fee: 100000,
      playerId: playerB.id,
      previousTeamId: teamB.id,
      newTeamId: teamA.id,
    },
  });

  // Goals
  const goalA = await prisma.matchGoals.upsert({
    where: { id: 1 },
    update: {},
    create: {
      matchId: 1,
      teamId: 1,
      goalscorerId: 1,
      goalTimestamp: new Date(),
      isOwnGoal: true,
    },
  });

  const goalB = await prisma.matchGoals.upsert({
    where: { id: 2 },
    update: {},
    create: {
      matchId: 1,
      teamId: 1,
      goalscorerId: 2,
      goalTimestamp: new Date(),
      isOwnGoal: false,
    },
  });

  const goalC = await prisma.matchGoals.upsert({
    where: { id: 3 },
    update: {},
    create: {
      matchId: 1,
      teamId: 1,
      goalscorerId: 2,
      goalTimestamp: new Date(),
      isOwnGoal: false,
    },
  });

  const goalD = await prisma.matchGoals.upsert({
    where: { id: 4 },
    update: {},
    create: {
      matchId: 1,
      teamId: 1,
      goalscorerId: 2,
      goalTimestamp: new Date(),
      isOwnGoal: true,
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
