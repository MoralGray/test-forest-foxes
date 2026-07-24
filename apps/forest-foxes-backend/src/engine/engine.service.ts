import { Injectable } from '@nestjs/common';

@Injectable()
export class EngineService {
    private enabled = false;

    getStatus() {
        return { enabled: this.enabled };
    }

    toggle() {
        this.enabled = !this.enabled;
        return { enabled: this.enabled };
    }
}
