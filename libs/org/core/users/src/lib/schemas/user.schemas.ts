import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
