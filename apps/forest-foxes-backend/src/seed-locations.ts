import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { createPrismaClient } from '@mg-nx-forge/forest-foxes-shared-prisma';

const url = process.env.FOREST_FOXES_DATABASE_URL ?? 'file:.db/forest-foxes/prod.db';
const adapter = new PrismaBetterSqlite3({ url });
const prisma = createPrismaClient(adapter);
await prisma.$connect();

const locations = [
    { id: 1, name: 'Северная поляна', gridRow: 1, gridCol: 1 },
    { id: 2, name: 'Туманная тропа', gridRow: 1, gridCol: 2 },
    { id: 3, name: 'Западный ручей', gridRow: 1, gridCol: 3 },
    { id: 4, name: 'Моховой овраг', gridRow: 2, gridCol: 1 },
    { id: 5, name: 'Центральная чаща', gridRow: 2, gridCol: 2 },
    { id: 6, name: 'Восточный склон', gridRow: 2, gridCol: 3 },
    { id: 7, name: 'Южное болото', gridRow: 3, gridCol: 1 },
    { id: 8, name: 'Старая берлога', gridRow: 3, gridCol: 2 },
    { id: 9, name: 'Лисья нора', gridRow: 3, gridCol: 3 },
];
for (const loc of locations) {
    await prisma.location.upsert({ where: { id: loc.id }, update: loc, create: loc });
}
await prisma.$disconnect();
console.log('[seed] 9 locations created');
