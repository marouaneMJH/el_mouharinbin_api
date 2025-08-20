import { User } from '../prisma/generated/client';

export class PaginatedUsersDto {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
