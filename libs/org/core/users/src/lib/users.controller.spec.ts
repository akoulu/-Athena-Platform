import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQuery } from './dto/user-query.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUserProfile = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserListResponse = {
    users: [mockUserProfile],
    total: 1,
    page: 1,
    limit: 20,
  };

  let mockUsersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    (controller as any).usersService = mockUsersService;
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
      mockUsersService.create.mockResolvedValue(mockUserProfile);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUserProfile);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when user already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('User with this email or username already exists')
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return list of users', async () => {
      const query: UserQuery = { page: 1, limit: 20 };
      mockUsersService.findAll.mockResolvedValue(mockUserListResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockUserListResponse);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter users by search query', async () => {
      const query: UserQuery = { search: 'test' };
      mockUsersService.findAll.mockResolvedValue(mockUserListResponse);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockUserListResponse);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserProfile);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUserProfile);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user', async () => {
      const updatedProfile = { ...mockUserProfile, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedProfile);

      const result = await controller.update('user-1', updateUserDto);

      expect(result).toEqual(updatedProfile);
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', updateUserDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.update.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.update('non-existent-id', updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('user-1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
