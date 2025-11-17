import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@org/auth';
import { UsersModule } from '@org/users';
import { HealthModule } from './health/health.module';
import { validate } from './config/env.validation';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '../../.env'), join(__dirname, '../../../.env'), '.env'],
      validate,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dialect = configService.get<string>('DB_DIALECT', 'sqlite');
        const isPostgres = dialect === 'postgres';
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT')
          ? Number(configService.get('DB_PORT'))
          : undefined;
        const database = configService.get<string>('DB_NAME');
        const username = configService.get<string>('DB_USER');
        const password = configService.get<string>('DB_PASS');

        // For Supabase connection pooler (port 6543), use transaction mode
        // Direct connection (port 5432) only supports IPv6
        const isPooler = port === 6543;
        if (isPostgres && isPooler) {
          console.log(`[DB] Using Supabase connection pooler (port 6543) for IPv4 support`);
        }

        // Log connection info (without password) for debugging
        if (isPostgres) {
          console.log(`[DB] Connecting to PostgreSQL: ${username}@${host}:${port}/${database}`);
        }

        return {
          dialect: (dialect as 'postgres' | 'sqlite' | 'mysql' | 'mariadb' | 'mssql') || 'sqlite',
          storage: configService.get<string>('DB_STORAGE', 'data/dev.sqlite'),
          host,
          port,
          database,
          username,
          password,
          dialectOptions:
            isPostgres && configService.get<string>('DB_SSL') === 'true'
              ? {
                  ssl: {
                    require: true,
                    rejectUnauthorized: false,
                  },
                  keepAlive: true,
                  connectTimeout: 10000,
                }
              : isPostgres
              ? {
                  keepAlive: true,
                  connectTimeout: 10000,
                }
              : {},
          autoLoadModels: true,
          synchronize: false,
          logging:
            configService.get<string>('NODE_ENV') === 'development'
              ? (sql: string) => console.log(sql)
              : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
