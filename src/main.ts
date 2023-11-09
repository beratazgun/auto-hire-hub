import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import sessions from 'express-session';
import RedisStore from 'connect-redis';
import { redisClient } from './core/libs/redisClient';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from '@src/core/filters/HttpException.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors), // this will throw the error if the validation fails.
      whitelist: true, // this will remove all the extra fields from the request body
    }),
  ); // this is for global validation

  app.useGlobalFilters(new HttpExceptionFilter(app.get(LoggerService)));

  app.useStaticAssets(join(__dirname, 'common/public'));
  app.setViewEngine('ejs');
  app.use(cookieParser());

  app.enableCors({
    credentials: true, // This is important.
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.use(
    helmet({
      xssFilter: true, // XSS attack
      frameguard: true, // Clickjacking
      hsts: true, // HTTP Strict Transport Security
      noSniff: true, // MIME sniffing
      hidePoweredBy: true, // Hide X-Powered-By
    }),
  );

  app.use(
    sessions({
      store: new RedisStore({
        client: redisClient,
        prefix: 'sesID#',
      }),
      name: 'sesID',
      secret: configService.get<string>('SESSION_SECRET'),
      cookie: {
        httpOnly: true,
        // maxAge: Number(configService.get<number>('SESSION_TIME')) * 1000,
        maxAge: 1000 * 60 * 60 * 24 * 3, // 7 days
        secure: false,
      },
      resave: true,
      saveUninitialized: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AutoHireHub API')
    .setDescription('The AutoHireHub API description')
    .setVersion('1.0')
    .addTag('renter', 'Renter API')
    .addTag('carOwner', 'CarOwner API')
    .addTag('car', 'Car API')
    .addTag('driverLicance', 'DriverLicance API')
    .addTag('rentCar', 'RentCar API')
    .addTag('view', 'View API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get<string>('PORT'));
}

bootstrap();
