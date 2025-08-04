import { Injectable, Logger } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../../prisma/src/prisma.service';

@Injectable()
export class RoleService {

  private readonly logger = new Logger(RoleService.name);

  private readonly usersIncludes = {
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        ...createRoleDto
      }
    }
    );
  }

  findAll() {
    return "" ;
  }

  findOne(id: number) {
    return "";
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return ""
  }
}
