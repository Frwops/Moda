import { Injectable } from '@nestjs/common';

export type RootResponse = {
  readonly name: string;
  readonly version: string;
};

@Injectable()
export class AppService {
  getRoot(): RootResponse {
    return { name: 'moda-api', version: '0.0.1' };
  }
}
