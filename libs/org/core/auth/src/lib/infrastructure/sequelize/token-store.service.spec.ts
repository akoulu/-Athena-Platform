import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { TokenStoreService } from './token-store.service';
import { RefreshTokenModel } from './models/refresh-token.model';
import { BlacklistedTokenModel } from './models/blacklisted-token.model';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('TokenStoreService', () => {
  let service: TokenStoreService;
  let refreshTokenModel: jest.Mocked<typeof RefreshTokenModel>;
  let blacklistedModel: jest.Mocked<typeof BlacklistedTokenModel>;

  const mockRefreshToken = {
    userId: 'user-1',
    tokenHash: 'hashedToken',
    familyId: 'family-1',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    createdAt: new Date(),
  };

  const mockBlacklistedToken = {
    jti: 'jti-1',
    tokenHash: 'hashedBlacklistedToken',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  };

  beforeEach(async () => {
    const mockRefreshTokenModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
    };

    const mockBlacklistedModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenStoreService,
        {
          provide: getModelToken(RefreshTokenModel),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: getModelToken(BlacklistedTokenModel),
          useValue: mockBlacklistedModel,
        },
      ],
    }).compile();

    service = module.get<TokenStoreService>(TokenStoreService);
    refreshTokenModel = module.get(getModelToken(RefreshTokenModel));
    blacklistedModel = module.get(getModelToken(BlacklistedTokenModel));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should hash token and save to database', async () => {
      const userId = 'user-1';
      const token = 'rawToken';
      const familyId = 'family-1';
      const expiresAt = new Date();

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      (refreshTokenModel.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      await service.save(userId, token, familyId, expiresAt);

      expect(bcrypt.hash).toHaveBeenCalledWith(token, 12);
      expect(refreshTokenModel.create).toHaveBeenCalledWith({
        userId,
        tokenHash: 'hashedToken',
        familyId,
        expiresAt,
      });
    });
  });

  describe('match', () => {
    it('should return ok: true with familyId when token matches', async () => {
      const userId = 'user-1';
      const token = 'rawToken';
      const mockRows = [
        {
          ...mockRefreshToken,
          tokenHash: 'hashedToken1',
          familyId: 'family-1',
        },
        {
          ...mockRefreshToken,
          tokenHash: 'hashedToken2',
          familyId: 'family-2',
        },
      ];

      (refreshTokenModel.findAll as jest.Mock).mockResolvedValue(mockRows);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false) // First token doesn't match
        .mockResolvedValueOnce(true); // Second token matches

      const result = await service.match(userId, token);

      expect(refreshTokenModel.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: true, familyId: 'family-2' });
    });

    it('should return ok: false when no token matches', async () => {
      const userId = 'user-1';
      const token = 'rawToken';
      const mockRows = [
        {
          ...mockRefreshToken,
          tokenHash: 'hashedToken1',
        },
      ];

      (refreshTokenModel.findAll as jest.Mock).mockResolvedValue(mockRows);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.match(userId, token);

      expect(result).toEqual({ ok: false });
    });

    it('should return ok: false when no tokens found', async () => {
      const userId = 'user-1';
      const token = 'rawToken';

      (refreshTokenModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await service.match(userId, token);

      expect(result).toEqual({ ok: false });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('revokeFamily', () => {
    it('should delete all tokens with given familyId', async () => {
      const familyId = 'family-1';

      (refreshTokenModel.destroy as jest.Mock).mockResolvedValue(undefined);

      await service.revokeFamily(familyId);

      expect(refreshTokenModel.destroy).toHaveBeenCalledWith({
        where: { familyId },
      });
    });
  });

  describe('blacklist', () => {
    it('should hash token and add to blacklist with jti', async () => {
      const rawToken = 'rawToken';
      const expiresAt = new Date();
      const jti = 'jti-1';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      (blacklistedModel.create as jest.Mock).mockResolvedValue(mockBlacklistedToken);

      await service.blacklist(rawToken, expiresAt, jti);

      expect(bcrypt.hash).toHaveBeenCalledWith(rawToken, 12);
      expect(blacklistedModel.create).toHaveBeenCalledWith({
        jti,
        tokenHash: 'hashedToken',
        expiresAt,
      });
    });

    it('should use empty string for jti when not provided', async () => {
      const rawToken = 'rawToken';
      const expiresAt = new Date();

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      (blacklistedModel.create as jest.Mock).mockResolvedValue(mockBlacklistedToken);

      await service.blacklist(rawToken, expiresAt);

      expect(blacklistedModel.create).toHaveBeenCalledWith({
        jti: '',
        tokenHash: 'hashedToken',
        expiresAt,
      });
    });
  });

  describe('isBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      const rawToken = 'rawToken';
      const mockRows = [
        {
          ...mockBlacklistedToken,
          tokenHash: 'hashedToken1',
        },
        {
          ...mockBlacklistedToken,
          tokenHash: 'hashedToken2',
        },
      ];

      (blacklistedModel.findAll as jest.Mock).mockResolvedValue(mockRows);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false) // First token doesn't match
        .mockResolvedValueOnce(true); // Second token matches

      const result = await service.isBlacklisted(rawToken);

      expect(blacklistedModel.findAll).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should return false when token is not blacklisted', async () => {
      const rawToken = 'rawToken';
      const mockRows = [
        {
          ...mockBlacklistedToken,
          tokenHash: 'hashedToken1',
        },
      ];

      (blacklistedModel.findAll as jest.Mock).mockResolvedValue(mockRows);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.isBlacklisted(rawToken);

      expect(result).toBe(false);
    });

    it('should return false when blacklist is empty', async () => {
      const rawToken = 'rawToken';

      (blacklistedModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await service.isBlacklisted(rawToken);

      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('isJtiBlacklisted', () => {
    it('should return true when jti is blacklisted', async () => {
      const jti = 'jti-1';

      (blacklistedModel.findOne as jest.Mock).mockResolvedValue(mockBlacklistedToken);

      const result = await service.isJtiBlacklisted(jti);

      expect(blacklistedModel.findOne).toHaveBeenCalledWith({
        where: { jti },
      });
      expect(result).toBe(true);
    });

    it('should return false when jti is not blacklisted', async () => {
      const jti = 'jti-1';

      (blacklistedModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.isJtiBlacklisted(jti);

      expect(result).toBe(false);
    });
  });
});
