import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'libs/contract/dtos/users/create-user.dto';
import { AuthPayloadDto } from 'libs/contract/dtos/dto/auth-payload.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(this.constructor.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'User Login',
    description: `
Authenticate user with email and password to receive JWT access token.

**Usage:**
- Send user credentials (email and password)
- Receive JWT token for authenticated requests
- Token should be included in Authorization header for protected endpoints

**Response:**
- Returns JWT access token and user information
- Token expires according to system configuration
- Use token in Authorization header: "Bearer {token}"
    `
  })
  @ApiBody({
    type: AuthPayloadDto,
    description: 'User login credentials',
    examples: {
      validLogin: {
        summary: 'Valid login credentials',
        description: 'Example of valid user login request',
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - JWT token returned',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User unique identifier' },
            email: { type: 'string', description: 'User email address' },
            username: { type: 'string', description: 'User display name' },
            status: { type: 'string', description: 'User account status' }
          }
        },
        expiresIn: {
          type: 'string',
          description: 'Token expiration time',
          example: '24h'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data - missing or malformed email/password',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['email must be a valid email', 'password is required']
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials - email or password incorrect',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async login(@Body() loginPayload: AuthPayloadDto) {
    this.logger.debug(`request: ${loginPayload.email}`);

    return await this.authService.login(loginPayload);
  }

  @Post('sign-up')
  @ApiOperation({ 
    summary: 'User Registration',
    description: `
Register a new user account in the NoFap platform.

**Process:**
1. User submits registration information
2. System validates data and creates account
3. Account created with 'PENDING' status
4. Activation email sent to user's email address
5. User must activate account via email link

**Requirements:**
- Unique email address
- Strong password (minimum 8 characters)
- Valid username
- All required fields completed

**Next Steps:**
- Check email for activation link
- Click activation link to activate account
- Login with activated credentials
    `
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'New user registration data',
    examples: {
      newUser: {
        summary: 'Complete user registration',
        description: 'Example of new user registration with all required fields',
        value: {
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          username: 'newuser123',
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered - activation email sent',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'User registered successfully. Please check your email for activation link.' 
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'New user ID' },
            email: { type: 'string', description: 'User email' },
            username: { type: 'string', description: 'User username' },
            status: { type: 'string', example: 'PENDING', description: 'Account status (awaiting activation)' },
            createdAt: { type: 'string', format: 'date-time', description: 'Account creation timestamp' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Registration failed - validation errors or duplicate data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'array',
          items: { type: 'string' },
          example: [
            'email must be a valid email',
            'password must be at least 8 characters long',
            'username is already taken'
          ]
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('activate/:token')
  @ApiOperation({ 
    summary: 'Account Activation',
    description: `
Activate user account using activation token received via email.

**Process:**
1. User receives activation email after registration
2. Email contains unique activation link with token
3. User clicks link or makes GET request to this endpoint
4. Token is validated and account status updated to 'ACTIVE'
5. User can now login with their credentials

**Token Characteristics:**
- Single-use activation token
- Time-limited (expires after 24 hours)
- Unique per user account
- Automatically invalidated after successful activation

**After Activation:**
- Account status changes to 'ACTIVE'
- User can login normally
- All platform features become available
    `
  })
  @ApiParam({
    name: 'token',
    description: 'Account activation token received via email',
    type: 'string',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  })
  @ApiResponse({
    status: 200,
    description: 'Account successfully activated',
    schema: {
      type: 'object',
      properties: {
        message: { 
          type: 'string', 
          example: 'Account activated successfully. You can now login.' 
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'User ID' },
            email: { type: 'string', description: 'User email' },
            username: { type: 'string', description: 'User username' },
            status: { type: 'string', example: 'ACTIVE', description: 'Updated account status' },
            activatedAt: { type: 'string', format: 'date-time', description: 'Activation timestamp' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired activation token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid or expired activation token' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Activation token not found or already used',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Activation token not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async activateAccount(@Param('token') token: string) {
    return await this.authService.activateAccount(token);
  }
}
