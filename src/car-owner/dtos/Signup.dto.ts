import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  Length,
  Matches,
} from 'class-validator';
import { IsPasswordEqual } from '@src/core/decorators/IsPasswordEqual';
import { IsPasswordStrong } from '@src/core/decorators/IsPasswordStrong';

export class SignupDto {
  @IsString()
  @Length(2, 30)
  @IsNotEmpty()
  firstName: string;

  @Length(2, 30)
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('TR')
  phone: string;

  @IsPasswordStrong({
    message(validationArguments) {
      const [warning] = validationArguments.constraints;
      return `${warning}`;
    },
  })
  @IsNotEmpty()
  @Length(6, 30)
  password: string;

  @IsNotEmpty()
  @IsPasswordEqual('password', {
    message: 'passwords are not equal',
  })
  passwordConfirmation: string;
}
