import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { RefreshTokenModel } from './models/refresh-token.model';
import { BlacklistedTokenModel } from './models/blacklisted-token.model';
import { ResetTokenModel } from './models/reset-token.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenStoreService {
  constructor(
    @InjectModel(RefreshTokenModel) private refreshTokens: typeof RefreshTokenModel,
    @InjectModel(BlacklistedTokenModel) private blacklisted: typeof BlacklistedTokenModel,
    @InjectModel(ResetTokenModel) private resetTokens: typeof ResetTokenModel
  ) {}

  async save(userId: string, token: string, familyId: string, expiresAt: Date): Promise<void> {
    const tokenHash = await bcrypt.hash(token, 12);
    await this.refreshTokens.create({ userId, tokenHash, familyId, expiresAt });
  }

  async match(userId: string, token: string): Promise<{ ok: boolean; familyId?: string }> {
    const rows = await this.refreshTokens.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    for (const row of rows) {
      const ok = await bcrypt.compare(token, row.tokenHash);
      if (ok) {
        return { ok: true, familyId: row.familyId };
      }
    }
    return { ok: false };
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.refreshTokens.destroy({ where: { familyId } });
  }

  async blacklist(rawToken: string, expiresAt: Date, jti?: string): Promise<void> {
    const tokenHash = await bcrypt.hash(rawToken, 12);
    await this.blacklisted.create({ jti: jti || '', tokenHash, expiresAt });
  }

  async isBlacklisted(rawToken: string): Promise<boolean> {
    const all = await this.blacklisted.findAll();
    for (const row of all) {
      if (await bcrypt.compare(rawToken, row.tokenHash)) return true;
    }
    return false;
  }
  async isJtiBlacklisted(jti: string): Promise<boolean> {
    const row = await this.blacklisted.findOne({ where: { jti } });
    return !!row;
  }

  async saveResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // Delete any existing reset tokens for this user
    await this.resetTokens.destroy({ where: { userId } });
    const tokenHash = await bcrypt.hash(token, 12);
    await this.resetTokens.create({ userId, tokenHash, expiresAt });
  }

  async validateResetToken(userId: string, token: string): Promise<boolean> {
    const rows = await this.resetTokens.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    for (const row of rows) {
      const isValid = await bcrypt.compare(token, row.tokenHash);
      if (isValid) {
        // Check if token is expired
        if (row.expiresAt < new Date()) {
          await this.resetTokens.destroy({ where: { id: row.id } });
          return false;
        }
        return true;
      }
    }
    return false;
  }

  async deleteResetToken(userId: string): Promise<void> {
    await this.resetTokens.destroy({ where: { userId } });
  }

  async cleanupExpiredResetTokens(): Promise<void> {
    await this.resetTokens.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }
}
