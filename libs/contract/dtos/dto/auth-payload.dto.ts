import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LoginPayloadI } from '../../interfaces/login-payload.interface';

export class AuthPayloadDto implements LoginPayloadI {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
