import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

const validToken = 'valid.jwt.token';
const expiredToken = 'expired.jwt.token';
const userPayload = {
  id: 'user123',
  email: 'testuser',
  exp: Math.floor(Date.now() / 1000) + 60,
};
const expiredPayload = {
  id: 'user123',
  email: 'testuser',
  exp: Math.floor(Date.now() / 1000) - 60,
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway, ChatService],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

describe('ChatGateway JWT WebSocket Auth', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let jwtService: JwtService;

  beforeEach(async () => {
    chatService = { createSession: jest.fn(), removeSession: jest.fn() } as any;
    jwtService = { verify: jest.fn() } as any;
    gateway = new ChatGateway(chatService, jwtService);
  });

  function mockSocket(token?: string) {
    return {
      handshake: {
        auth: { token },
        query: { token },
        headers: { authorization: token ? `Bearer ${token}` : undefined },
      },
      data: {},
      disconnect: jest.fn(),
    } as unknown as Socket;
  }

  it('should accept connection with valid token and create session', async () => {
    (jwtService.verify as any).mockReturnValue(userPayload);
    const client = mockSocket(validToken);
    await gateway.handleConnection(client);
    expect(client.disconnect).not.toHaveBeenCalled();
    expect(chatService.createSession).toHaveBeenCalledWith({
      userId: userPayload.id,
      username: userPayload.email,
    });
    expect(client.data.user).toEqual({
      id: userPayload.id,
      username: userPayload.email,
    });
  });

  it('should reject connection without token', async () => {
    const client = mockSocket(undefined);
    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(chatService.createSession).not.toHaveBeenCalled();
  });

  it('should reject connection with expired token', async () => {
    (jwtService.verify as any).mockReturnValue(expiredPayload);
    const client = mockSocket(expiredToken);
    await gateway.handleConnection(client);
    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(chatService.createSession).not.toHaveBeenCalled();
  });
});
