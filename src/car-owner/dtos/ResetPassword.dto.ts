import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsPasswordEqual } from '@src/core/decorators/IsPasswordEqual';
import { IsPasswordStrong } from '@src/core/decorators/IsPasswordStrong';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  @IsPasswordStrong({
    message(validationArguments) {
      const [warning] = validationArguments.constraints;
      return `${warning}`;
    },
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsPasswordEqual('newPassword', {
    message: 'New Password and confirm password should be same.',
  })
  newPasswordConfirmation: string;
}
