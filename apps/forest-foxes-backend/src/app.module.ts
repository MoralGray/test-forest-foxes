import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { EngineModule } from './engine/engine.module.js';
import { ObservationsModule } from './observations/observations.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
    imports: [PrismaModule, ObservationsModule, EngineModule],
    controllers: [AppController],
    providers: [
        {
            provide: APP_PIPE,
            useFactory: () =>
                new ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                    transform: true,
                    transformOptions: { enableImplicitConversion: true },
                }),
        },
    ],
})
export class AppModule {}
