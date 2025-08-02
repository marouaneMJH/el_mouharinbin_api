export interface PrismaQueryOptions<Where, WhereUnique, OrderBy> {
  skip?: number;
  take?: number;
  cursor?: WhereUnique;
  where?: Where;
  orderBy?: OrderBy;
}
