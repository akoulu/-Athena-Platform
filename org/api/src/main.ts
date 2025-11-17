import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter, RequestIdMiddleware } from '@org/auth';
import helmet from 'helmet';
import { setDefaultResultOrder } from 'dns';

// Force IPv4 for database connections (fixes ETIMEDOUT on IPv6)
setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Request ID middleware (applied globally as Express middleware)
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use((req: any, res: any, next: any) => {
    requestIdMiddleware.use(req, res, next);
  });

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Org API')
    .setDescription('API documentation for Org application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger path must include the full path including globalPrefix
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger documentation: http://localhost:${port}/${globalPrefix}/docs`);
  Logger.log(`🏥 Health check: http://localhost:${port}/${globalPrefix}/health`);
}

bootstrap();
