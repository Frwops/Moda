import { Controller, Get } from '@nestjs/common';

export type HealthResponse = {
  readonly status: string;
};

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
