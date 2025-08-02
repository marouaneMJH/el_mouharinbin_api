import { Prisma } from './../../../apps/users/src/generated/client';
import { PrismaQueryOptions } from './pagination.interface';

export type UserQueryOptions = PrismaQueryOptions<
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserOrderByWithRelationInput
>;
