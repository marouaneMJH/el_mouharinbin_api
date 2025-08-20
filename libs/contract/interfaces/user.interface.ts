import { Prisma, User } from '../prisma/generated/client';
import { PrismaQueryOptions } from './pagination.interface';

export type UserQueryOptions = PrismaQueryOptions<
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserOrderByWithRelationInput
>;

export interface UserAuthI extends  User{

}

export interface UserI  extends  Omit<UserAuthI, "password"> {password?: string}