import { PrismaQueryOptions } from './pagination.interface';
import { User, Prisma } from '../prisma/generated/client';

export type UserQueryOptions = PrismaQueryOptions<
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserOrderByWithRelationInput
>;

export interface UserAuthI extends User {}

export interface UserI extends Omit<UserAuthI, 'password'> {
  password?: string;
}
