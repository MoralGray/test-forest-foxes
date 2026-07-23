import { createPrismaClient, type PrismaClient } from '@mg-nx-forge/forest-foxes-shared-prisma';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve } from 'path';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public prisma: PrismaClient;

    constructor() {
        const repoRoot = resolve(import.meta.dirname, '..', '..', '..', '..');
        let url = process.env.FOREST_FOXES_DATABASE_URL ?? `file:${resolve(repoRoot, '.db/forest-foxes/dev.db')}`;
        if (url.startsWith('file:') && !url.startsWith('file:/')) {
            url = `file:${resolve(repoRoot, url.slice(5))}`;
        }
        const adapter = new PrismaBetterSqlite3({ url });
        this.prisma = createPrismaClient(adapter);
    }

    async onModuleInit() {
        await this.prisma.$connect();
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
}
