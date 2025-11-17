import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, IsNumber, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV?: string = 'development';

  @IsNumber()
  @IsOptional()
  PORT?: number = 3000;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  DB_DIALECT?: string = 'sqlite';

  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsNumber()
  @IsOptional()
  DB_PORT?: number;

  @IsString()
  @IsOptional()
  DB_NAME?: string;

  @IsString()
  @IsOptional()
  DB_USER?: string;

  @IsString()
  @IsOptional()
  DB_PASS?: string;

  @IsString()
  @IsOptional()
  DB_STORAGE?: string = 'data/dev.sqlite';

  @IsString()
  @IsOptional()
  DB_SSL?: string = 'false';

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string = 'http://localhost:4200';

  @IsString()
  @IsOptional()
  EMAIL_ENABLED?: string = 'false';

  @IsString()
  @IsOptional()
  EMAIL_HOST?: string;

  @IsNumber()
  @IsOptional()
  EMAIL_PORT?: number = 587;

  @IsString()
  @IsOptional()
  EMAIL_SECURE?: string = 'false';

  @IsString()
  @IsOptional()
  EMAIL_USER?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD?: string;

  @IsString()
  @IsOptional()
  EMAIL_FROM?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      return Object.values(error.constraints || {}).join(', ');
    });
    throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
  }

  return validatedConfig;
}
