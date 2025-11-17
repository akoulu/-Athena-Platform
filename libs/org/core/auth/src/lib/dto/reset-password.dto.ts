import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ResetPasswordDto as IResetPasswordDto } from '@org/types';
import { AUTH_CONSTANTS } from '@org/constants';

export class ResetPasswordDto implements IResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
    minLength: AUTH_CONSTANTS.PASSWORD_MIN_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH)
  newPassword!: string;
}
