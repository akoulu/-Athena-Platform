import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserProfile, UserQuery, UserListResponse } from '@org/types';
import { USER_ROLES } from '@org/constants';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './infrastructure/sequelize/user.model';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(@InjectModel(UserModel) private usersRepo: typeof UserModel) {}

  async create(createUserDto: CreateUserDto): Promise<UserProfile> {
    const existingUser = await this.usersRepo.findOne({
      where: { email: createUserDto.email },
    });
    const existingUsername = await this.usersRepo.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUser || existingUsername) {
      throw new ConflictException('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltRounds);

    const user = await this.usersRepo.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      roles: createUserDto.roles?.map((role) => ({
        id: role,
        name: role,
        permissions: [],
      })) || [
        {
          id: USER_ROLES.USER,
          name: USER_ROLES.USER,
          permissions: [],
        },
      ],
      isActive: true,
    });
    return this.mapToProfile(user);
  }

  async findAll(query: UserQuery = {}): Promise<UserListResponse> {
    const { page = 1, limit = 20, search, role, isActive } = query;
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    // naive search on email/username
    const all = await this.usersRepo.findAll({ where });
    const filtered = all.filter((u) => {
      const okSearch = !search
        ? true
        : [u.email, u.username, u.firstName || '', u.lastName || '']
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase());
      const okRole = !role ? true : (u.roles || []).some((r) => r.name === role);
      return okSearch && okRole;
    });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = filtered.slice(start, end);
    return { users: paged.map((u) => this.mapToProfile(u)), total, page, limit };
  }

  async findOne(id: string): Promise<UserProfile> {
    const user = await this.usersRepo.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapToProfile(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.usersRepo.findOne({ where: { email } });
    return row ? (row.toJSON() as any) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const row = await this.usersRepo.findOne({ where: { username } });
    return row ? (row.toJSON() as any) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserProfile> {
    const user = await this.usersRepo.findByPk(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepo.findOne({ where: { email: updateUserDto.email } });
      if (existing) throw new ConflictException('User with this email already exists');
    }
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.usersRepo.findOne({
        where: { username: updateUserDto.username },
      });
      if (existing) throw new ConflictException('User with this username already exists');
    }
    await user.update({
      ...updateUserDto,
      roles: updateUserDto.roles
        ? updateUserDto.roles.map((role) => ({ id: role, name: role, permissions: [] }))
        : user.roles,
    });
    return this.mapToProfile(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepo.findByPk(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await user.destroy();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = await this.usersRepo.findByPk(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    await user.update({ password: hashedPassword });
  }

  async validateUser(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user.toJSON() as any;
  }

  private mapToProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: (user.roles || []).map((r: any) => r.name),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
