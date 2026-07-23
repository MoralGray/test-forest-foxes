export { PrismaClient } from './generated/prisma/client.js';
export type { Prisma } from './generated/prisma/client.js';

import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

export function createPrismaClient(adapter?: unknown) {
    const { PrismaClient: Client } = _require('./generated/prisma/client.js');
    return adapter ? new Client({ adapter }) : new Client();
}
