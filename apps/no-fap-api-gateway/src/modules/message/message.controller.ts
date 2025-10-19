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
    summary: 'Supprimer un message',
    description:
      "Permet à l'auteur ou aux modérateurs de supprimer un message (suppression logique)",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du message à supprimer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    description: 'Raison de la suppression (optionnelle)',
    required: false,
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Raison de la suppression',
          example: 'Contenu inapproprié',
          maxLength: 500,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message supprimé avec succès',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Permissions insuffisantes pour supprimer ce message',
  })
  @ApiResponse({
    status: 404,
    description: 'Message non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Message déjà supprimé',
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
