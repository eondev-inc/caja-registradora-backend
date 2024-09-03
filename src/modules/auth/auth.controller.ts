import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticationDto } from './dtos/authentication.dto';
import { Public } from '@/commons/decorators/public.decorator';
import { CreateUsersDto } from '@/generated/prisma/users/dto/create-users.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('authenticate')
  authenticateUser(@Body() jsonToken: AuthenticationDto) {
    return this.authService.authenticateUser(jsonToken);
  }

  @Public()
  @Post('register')
  registerUser(@Body() createuser: CreateUsersDto) {
    return this.authService.registerUser(createuser);
  }
}
