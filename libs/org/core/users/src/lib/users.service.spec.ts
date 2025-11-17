import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UserModel } from './infrastructure/sequelize/user.model';
import { CreateUserDto, UpdateUserDto } from '@org/types';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<typeof UserModel>;

  const createMockUser = (overrides: any = {}) => {
    const baseUser = {
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedPassword',
      roles: [{ id: 'user', name: 'user', permissions: [] }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      update: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      toJSON: jest.fn().mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        roles: [{ id: 'user', name: 'user', permissions: [] }],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    return { ...baseUser, ...overrides };
  };

  beforeEach(async () => {
    const mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(UserModel),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(UserModel));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should create a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(createMockUser());

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
      expect(result.roles).toEqual(['user']);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser());

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should create user with custom roles', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (userModel.create as jest.Mock).mockResolvedValue(
        createMockUser({
          email: 'admin@example.com',
          username: 'adminuser',
          roles: [{ id: 'admin', name: 'admin', permissions: [] }],
          toJSON: jest.fn().mockReturnValue({
            id: 'user-1',
            email: 'admin@example.com',
            username: 'adminuser',
            firstName: 'Test',
            lastName: 'User',
            password: 'hashedPassword',
            roles: [{ id: 'admin', name: 'admin', permissions: [] }],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        })
      );

      const result = await service.create({
        ...createUserDto,
        email: 'admin@example.com',
        username: 'adminuser',
        roles: ['admin'],
      });

      expect(result.roles).toEqual(['admin']);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      (userModel.findAll as jest.Mock).mockResolvedValue([
        createMockUser({ email: 'user1@example.com', username: 'user1' }),
        createMockUser({ email: 'user2@example.com', username: 'user2', firstName: 'John' }),
      ]);
    });

    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result.users.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 20);
    });

    it('should paginate results', async () => {
      const result = await service.findAll({ page: 1, limit: 1 });

      expect(result.users.length).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });

    it('should filter by search query', async () => {
      const result = await service.findAll({ search: 'John' });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users[0].firstName).toBe('John');
    });

    it('should filter by role', async () => {
      (userModel.findAll as jest.Mock).mockResolvedValue([
        createMockUser({
          email: 'admin@example.com',
          username: 'admin',
          roles: [{ id: 'admin', name: 'admin', permissions: [] }],
          toJSON: jest.fn().mockReturnValue({
            id: 'user-1',
            email: 'admin@example.com',
            username: 'admin',
            firstName: 'Test',
            lastName: 'User',
            password: 'hashedPassword',
            roles: [{ id: 'admin', name: 'admin', permissions: [] }],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        }),
      ]);

      const result = await service.findAll({ role: 'admin' });

      expect(result.users.every((u) => u.roles.includes('admin'))).toBe(true);
    });

    it('should filter by isActive', async () => {
      const result = await service.findAll({ isActive: true });

      expect(result.users.every((u) => u.isActive === true)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return user profile by id', async () => {
      (userModel.findByPk as jest.Mock).mockResolvedValue(createMockUser());

      const result = await service.findOne('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      (userModel.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user entity by email', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser());

      const result = await service.findByEmail('test@example.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user entity by username', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser());

      const result = await service.findByUsername('testuser');

      expect(result).not.toBeNull();
      expect(result?.username).toBe('testuser');
    });

    it('should return null when user not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const mockUser = createMockUser({ firstName: 'Updated', lastName: 'Name' });
      (userModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await service.update('user-1', updateDto);

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(mockUser.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      (userModel.findByPk as jest.Mock).mockResolvedValue(null);
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const mockUser = createMockUser({ email: 'user1@example.com' });
      (userModel.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (userModel.findOne as jest.Mock).mockResolvedValue(
        createMockUser({ email: 'user2@example.com' })
      );

      const updateDto: UpdateUserDto = {
        email: 'user2@example.com',
      };

      await expect(service.update('user-1', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      const mockUser = createMockUser();
      (userModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await service.remove('user-1');

      expect(mockUser.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      (userModel.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockUser = createMockUser();
      (userModel.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await service.updatePassword('user-1', 'newHashedPassword');

      expect(mockUser.update).toHaveBeenCalledWith({ password: 'newHashedPassword' });
    });

    it('should throw NotFoundException when user not found', async () => {
      (userModel.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.updatePassword('non-existent-id', 'newPassword')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('validateUser', () => {
    it('should return user entity when credentials are valid', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(createMockUser({ isActive: false }));

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });
});
