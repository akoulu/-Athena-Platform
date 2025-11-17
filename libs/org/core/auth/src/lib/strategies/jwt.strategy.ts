import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@org/types';
import { UsersService } from '@org/users';
import { AUTH_CONSTANTS } from '@org/constants';
import { TokenStoreService } from '../infrastructure/sequelize/token-store.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService, private tokenStore: TokenStoreService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: AUTH_CONSTANTS.JWT_SECRET,
    });
  }

  async validate(req: any, payload: JwtPayload & { jti?: string }) {
    const raw = (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
    // blacklist check by raw or jti
    if (raw && (await this.tokenStore.isBlacklisted(raw))) {
      throw new UnauthorizedException();
    }
    if (payload?.jti && (await this.tokenStore.isJtiBlacklisted(payload.jti))) {
      throw new UnauthorizedException();
    }
    const userEntity = await this.usersService.findByEmail(payload.email);
    if (!userEntity || !userEntity.isActive) {
      throw new UnauthorizedException();
    }
    return {
      id: userEntity.id,
      email: userEntity.email,
      username: userEntity.username,
      roles: userEntity.roles.map((r) => r.name),
    };
  }
}
