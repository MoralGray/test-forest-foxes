import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const PORT = Number(process.env.FOREST_FOXES_BACKEND_PORT) || 8020;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.setGlobalPrefix('api');
    await app.listen(PORT);
    console.log(`[forest-foxes-backend] Server running on http://localhost:${PORT}`);
}
bootstrap();
