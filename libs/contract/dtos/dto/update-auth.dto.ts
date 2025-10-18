import { PartialType } from '@nestjs/mapped-types';
import { AuthPayloadDto } from './auth-payload.dto';

export class UpdateAuthDto extends PartialType(AuthPayloadDto) {
  id: number;
}
