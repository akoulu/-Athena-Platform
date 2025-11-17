import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { UsersService } from '@org/users';
import type {
  AuthResponse,
  JwtPayload,
  UserProfile,
  LoginDto as ILoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@org/types';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AUTH_CONSTANTS } from '@org/constants';
import { UserEntity } from '@org/users';
import { TokenStoreService } from './infrastructure/sequelize/token-store.service';
import { EmailService } from './infrastructure/email/email.service';
import { addMilliseconds } from 'date-fns';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenStore: TokenStoreService,
    private emailService: EmailService
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    return this.usersService.validateUser(email, password);
  }

  async login(loginDto: ILoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateAuthResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new ConflictException('User with this username already exists');
    }

    const userProfile = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      username: registerDto.username,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    const user = await this.usersService.findOne(userProfile.id);
    if (!user) {
      throw new UnauthorizedException('Failed to create user');
    }

    const userEntity = await this.usersService.findByEmail(userProfile.email);
    if (!userEntity) {
      throw new UnauthorizedException('Failed to create user');
    }
    return await this.generateAuthResponse(userEntity);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: AUTH_CONSTANTS.JWT_SECRET,
      }) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const blacklisted = await this.tokenStore.isBlacklisted(refreshTokenDto.refreshToken);
    if (blacklisted) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const match = await this.tokenStore.match(payload.sub, refreshTokenDto.refreshToken);
    if (!match.ok) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // rotation: revoke family and issue new family
    if (match.familyId) {
      await this.tokenStore.revokeFamily(match.familyId);
    }

    const userEntity = await this.usersService.findByEmail(user.email);
    if (!userEntity) {
      throw new UnauthorizedException('User not found');
    }
    // issue new pair and store fresh refresh token
    return await this.generateAuthResponse(userEntity);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userEntity = await this.usersService.findByEmail(user.email);
    if (!userEntity) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.usersService.validateUser(user.email, changePasswordDto.oldPassword);
    if (!isValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashed = await bcrypt.hash(changePasswordDto.newPassword, AUTH_CONSTANTS.BCRYPT_ROUNDS);
    await this.usersService.updatePassword(userEntity.id, hashed);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return this.usersService.findOne(userId);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // blacklist provided refresh token and revoke its family
      try {
        const payload: any = this.jwtService.verify(refreshToken, {
          secret: AUTH_CONSTANTS.JWT_SECRET,
        });
        if (payload?.familyId) {
          await this.tokenStore.revokeFamily(payload.familyId);
        }
        const expMs = payload?.exp ? payload.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
        await this.tokenStore.blacklist(refreshToken, new Date(expMs));
      } catch {
        // ignore invalid token on logout
      }
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return;
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.tokenStore.saveResetToken(user.id, resetToken, expiresAt);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    let payload: JwtPayload & { type?: string };
    try {
      payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: AUTH_CONSTANTS.JWT_SECRET,
      }) as JwtPayload & { type?: string };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    // Validate token exists in database
    const isValid = await this.tokenStore.validateResetToken(payload.sub, resetPasswordDto.token);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userEntity = await this.usersService.findByEmail(user.email);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      AUTH_CONSTANTS.BCRYPT_ROUNDS
    );
    await this.usersService.updatePassword(payload.sub, hashedPassword);

    // Delete reset token after successful password reset
    await this.tokenStore.deleteResetToken(payload.sub);
  }

  async generateAuthResponse(user: UserEntity): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles.map((r) => r.name),
    };

    const jti = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: AUTH_CONSTANTS.JWT_EXPIRES_IN as StringValue,
      jwtid: jti,
    } as any);

    const familyId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const refreshPayload = { ...payload, familyId } as any;
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN as StringValue,
    });

    const ttlMs = AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN.endsWith('d')
      ? parseInt(AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    const expiresAt = addMilliseconds(new Date(), ttlMs);
    await this.tokenStore.save(user.id, refreshToken, familyId, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }
}
