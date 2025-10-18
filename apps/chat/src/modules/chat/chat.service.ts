import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PrismaService } from '../../../../../libs/contract/services/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession({
    userId,
    username,
    socketId,
  }: {
    userId: string;
    username: string;
    socketId: string;
  }) {
    // Create or update session for user
    await this.prisma.userSession.upsert({
      where: { id: userId }, // Assuming `id` is the unique field
      update: { username, connectedAt: new Date() },
      create: { userId, username, socketId, connectedAt: new Date() },
    });
  }

  async removeSession(userId: string) {
    await this.prisma.userSession.deleteMany({ where: { userId } });
  }

  test() {
    return 'Chat service is running';
  }
}
