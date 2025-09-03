import { UserStatus } from '../enums/user.enum';
import { $Enums } from '../prisma/generated/client';

export interface JwtPayloadI {
  id: string;
  role?: string;
  email: string;
  status: UserStatus | $Enums.UserStatus;
}

export default JwtPayloadI;
