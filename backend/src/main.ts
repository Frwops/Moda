import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const corsOrigins =
    process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ??
    ['http://localhost:5173'];
  app.enableCors({ origin: corsOrigins, credentials: true });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}
void bootstrap();
