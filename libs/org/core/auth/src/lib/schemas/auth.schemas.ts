import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleSchema {
  @ApiProperty({
    description: 'Role ID',
    example: 'role-123',
  })
  id!: string;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  name!: string;

  @ApiProperty({
    description: 'Role permissions',
    type: [String],
    example: ['read:users', 'write:users'],
  })
  permissions!: string[];
}

export class UserSchema {
  @ApiProperty({
    description: 'User ID',
    example: 'user-123',
  })
  id!: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username!: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiProperty({
    description: 'User roles',
    type: [RoleSchema],
  })
  roles!: RoleSchema[];

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}

export class UserProfileSchema {
  @ApiProperty({
    description: 'User ID',
    example: 'user-123',
  })
  id!: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username!: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiProperty({
    description: 'User roles',
    type: [String],
    example: ['user', 'admin'],
  })
  roles!: string[];

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}

export class AuthResponseSchema {
  @ApiProperty({
    description: 'User information',
    type: UserSchema,
  })
  user!: UserSchema;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}
