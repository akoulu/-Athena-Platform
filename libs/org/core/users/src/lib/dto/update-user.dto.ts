import { IsEmail, IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateUserDto as IUpdateUserDto } from '@org/types';

export class UpdateUserDto implements IUpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['user', 'admin'],
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @ApiPropertyOptional({
    description: 'User active status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
