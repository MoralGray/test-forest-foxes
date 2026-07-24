import { Controller, Get, Inject, Post } from '@nestjs/common';
import { EngineService } from './engine.service.js';

@Controller()
export class EngineController {
    constructor(@Inject(EngineService) private readonly engineService: EngineService) {}

    @Get('engine/status')
    getStatus() {
        return this.engineService.getStatus();
    }

    @Post('engine/toggle')
    toggle() {
        return this.engineService.toggle();
    }
}
