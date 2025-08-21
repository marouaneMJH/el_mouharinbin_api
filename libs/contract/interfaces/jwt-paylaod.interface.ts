import { UserStatus } from '../enums/user.enum';

export interface JwtPayloadI{
  id: string;
  role:string;
  email: string;
  status: UserStatus
}

export default JwtPayloadI;