import { Module } from '@nestjs/common';
import { ObservationsAnalyticsService } from './observations-analytics.service.js';
import { ObservationsImportService } from './observations-import.service.js';
import { ObservationsSeedService } from './observations-seed.service.js';
import { ObservationsController } from './observations.controller.js';
import { ObservationsService } from './observations.service.js';
import { SseService } from './sse.service.js';

@Module({
    controllers: [ObservationsController],
    providers: [
        ObservationsService,
        ObservationsAnalyticsService,
        ObservationsImportService,
        ObservationsSeedService,
        SseService,
    ],
    exports: [ObservationsService, SseService],
})
export class ObservationsModule {}
