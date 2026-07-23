import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Sse,
} from '@nestjs/common';
import { map } from 'rxjs';
import type { CreateObservationDto } from './dto/create-observation.dto.js';
import type { UpdateObservationDto } from './dto/update-observation.dto.js';
import { ObservationsAnalyticsService } from './observations-analytics.service.js';
import { ObservationsImportService } from './observations-import.service.js';
import { ObservationsSeedService } from './observations-seed.service.js';
import { ObservationsService } from './observations.service.js';
import { SseService } from './sse.service.js';

@Controller()
export class ObservationsController {
    constructor(
        @Inject(ObservationsService) private readonly service: ObservationsService,
        @Inject(ObservationsAnalyticsService) private readonly analyticsService: ObservationsAnalyticsService,
        @Inject(ObservationsImportService) private readonly importService: ObservationsImportService,
        @Inject(ObservationsSeedService) private readonly seedService: ObservationsSeedService,
        @Inject(SseService) private readonly sseService: SseService
    ) {}

    @Post('observations')
    create(@Body() dto: CreateObservationDto) {
        return this.service.create(dto);
    }

    @Get('observations')
    findAll(
        @Query('status') status?: string,
        @Query('location_id') locationId?: string,
        @Query('fox_id') foxId?: string,
        @Query('suspicion_min') suspicionMin?: string,
        @Query('sort') sort?: string,
        @Query('order') order?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        return this.service.findAll({
            status,
            locationId: locationId ? Number(locationId) : undefined,
            foxId,
            suspicionMin: suspicionMin ? Number(suspicionMin) : undefined,
            sort,
            order,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });
    }

    @Sse('observations/stream')
    stream() {
        return this.sseService.stream().pipe(map((event) => ({ data: JSON.stringify(event) })));
    }

    @Get('observations/stats')
    stats(@Query('tab') tab?: string) {
        return this.analyticsService.stats(tab);
    }

    @Get('observations/top-suspicious')
    topSuspicious(@Query('limit') limit?: string, @Query('status') status?: string, @Query('tab') tab?: string) {
        return this.analyticsService.topSuspicious(limit ? Number(limit) : undefined, status, tab);
    }

    @Post('observations/import')
    importObservations(@Body() events: CreateObservationDto[]) {
        if (!Array.isArray(events) || events.length === 0) {
            throw new BadRequestException('Expected non-empty array of observations');
        }
        return this.importService.importObservations(events);
    }

    @Get('observations/:id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch('observations/:id')
    update(@Param('id') id: string, @Body() dto: UpdateObservationDto) {
        return this.service.update(id, dto);
    }

    @Patch('observations/:id/process')
    process(@Param('id') id: string) {
        return this.service.process(id);
    }

    @Delete('observations/:id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }

    @Get('locations')
    findAllLocations() {
        return this.analyticsService.findAllLocations();
    }

    @Get('locations/:id')
    findLocation(@Param('id') id: string) {
        return this.analyticsService.findLocation(Number(id));
    }

    @Post('seeds/clean')
    seedClean() {
        return this.seedService.seedClean();
    }

    @Post('seeds/working')
    seedWorking() {
        return this.seedService.seedWorking();
    }

    @Post('seeds/crash-test')
    seedCrashTest() {
        return this.seedService.seedCrashTest();
    }
}
