import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // In production all API routes are prefixed with /api
  if (isProduction) {
    app.setGlobalPrefix('api');
  }

  // Enable CORS for frontend (allows cookies to be sent)
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // In production, also allow the Render frontend URL
      const frontendUrl = process.env.FRONTEND_URL;
      if (isProduction && frontendUrl && origin === frontendUrl) {
        return callback(null, true);
      }

      // Allow localhost on any port (handles localhost, 127.0.0.1, WSL hostnames)
      const allowedOrigins = [
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/.+\.local:\d+$/,
      ];

      const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Parse cookies from requests (needed for refresh token)
  app.use(cookieParser());

  // Automatically validate all incoming requests using DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // In production, serve the React build and handle client-side routing
  if (isProduction) {
    const clientDist = join(__dirname, '..', '..', '..', 'client', 'dist');
    app.useStaticAssets(clientDist);

    // Only serve index.html for non-API routes
    app.use((req: any, res: any, next: any) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(clientDist, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
