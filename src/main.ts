import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import cookieParser from 'cookie-parser';
// import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  // app.use(cookieParser());
  // app.use(express.json());
  app.setGlobalPrefix('api/v1', {exclude: ['/']});
  app.enableCors();
  await app.listen(8000);
}
bootstrap();
