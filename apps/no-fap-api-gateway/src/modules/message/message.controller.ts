import {
  Controller,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Inject,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  DeleteMessageDto,
  MessageResponseDto,
} from '../../../../../libs/contract/dtos/chat';
import { JwtAuthGuard } from '../../../../../libs/contract/guards/jwt.guard';
import JwtPayloadI from '../../../../../libs/contract/interfaces/jwt-paylaod.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayloadI;
}

interface DeleteMessageRequest {
  reason?: string;
}

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('api/messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    @Inject('CHAT_SERVICE') private readonly chatClient: ClientProxy,
  ) {}

  /**
   * Supprimer un message (soft delete)
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Message',
    description: `
Delete a message with soft deletion (message remains in database but marked as deleted).

**Authorization:**
- Message author can delete their own messages
- Community moderators can delete any message in their communities
- Community owners can delete any message in their communities
- System administrators can delete any message

**Soft Deletion:**
- Message content is replaced with "[Message deleted]"
- Original metadata preserved for audit purposes
- Deletion timestamp and reason recorded
- Message ID remains valid for references

**Audit Trail:**
- Deletion reason (optional but recommended)
- Deleted by user ID and username
- Deletion timestamp
- Original message preserved in audit logs

**Real-time Updates:**
- All connected community members notified via WebSocket
- Message deletion event broadcasted via RabbitMQ
- UI updated in real-time for all clients
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID to delete (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid'
    }
  })
  @ApiBody({
    description: 'Optional deletion details',
    required: false,
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for message deletion (recommended for moderation)',
          example: 'Inappropriate content - spam',
          maxLength: 500,
          minLength: 3
        },
      },
      example: {
        reason: 'Content violates community guidelines'
      }
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message deleted successfully',
    type: MessageResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: '[Message deleted]',
        isDeleted: true,
        deletedAt: '2024-01-15T14:20:00Z',
        deletedBy: 'user-456',
        deletedByUsername: 'moderator_user',
        deletionReason: 'Content violates community guidelines'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Message already deleted or invalid request',
    schema: {
      example: {
        statusCode: 400,
        message: 'This message has already been deleted',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to delete this message',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to delete this message',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Message not found',
        error: 'Not Found'
      }
    }
  })
  async deleteMessage(
    @Param('id') messageId: string,
    @Body() body: DeleteMessageRequest,
    @Request() req: AuthenticatedRequest,
  ): Promise<MessageResponseDto> {
    try {
      const deleteMessageDto: DeleteMessageDto = {
        messageId,
        deletedBy: req.user.id,
        deletedByUsername: req.user.email.split('@')[0], // Use email prefix as username fallback
        reason: body.reason,
      };

      const result = await firstValueFrom(
        this.chatClient.send('chat.message.delete', deleteMessageDto),
      );

      return result;
    } catch (error: any) {
      if (
        error.message?.includes('non trouvé') ||
        error.message?.includes('not found')
      ) {
        throw new HttpException('Message non trouvé', HttpStatus.NOT_FOUND);
      }

      if (
        error.message?.includes('déjà été supprimé') ||
        error.message?.includes('already deleted')
      ) {
        throw new HttpException(
          'Ce message a déjà été supprimé',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error.message?.includes('permissions') ||
        error.message?.includes('forbidden') ||
        error.message?.includes('membre')
      ) {
        throw new HttpException(
          "Vous n'avez pas les permissions pour supprimer ce message",
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        'Erreur interne lors de la suppression du message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
