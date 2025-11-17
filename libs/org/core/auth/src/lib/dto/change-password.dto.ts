import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ChangePasswordDto as IChangePasswordDto } from '@org/types';

export class ChangePasswordDto implements IChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldpassword123',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}
