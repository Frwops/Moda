import { Controller, Get } from '@nestjs/common';
import { AppService, type RootResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): RootResponse {
    return this.appService.getRoot();
  }
}
