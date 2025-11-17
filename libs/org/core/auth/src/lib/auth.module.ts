import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@org/users';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AUTH_CONSTANTS } from '@org/constants';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshTokenModel } from './infrastructure/sequelize/models/refresh-token.model';
import { BlacklistedTokenModel } from './infrastructure/sequelize/models/blacklisted-token.model';
import { ResetTokenModel } from './infrastructure/sequelize/models/reset-token.model';
import { TokenStoreService } from './infrastructure/sequelize/token-store.service';
import { EmailService } from './infrastructure/email/email.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: AUTH_CONSTANTS.JWT_SECRET,
      signOptions: {
        expiresIn: AUTH_CONSTANTS.JWT_EXPIRES_IN as StringValue,
      },
    }),
    SequelizeModule.forFeature([RefreshTokenModel, BlacklistedTokenModel, ResetTokenModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, TokenStoreService, EmailService],
  exports: [AuthService, TokenStoreService, EmailService],
})
export class AuthModule {}
