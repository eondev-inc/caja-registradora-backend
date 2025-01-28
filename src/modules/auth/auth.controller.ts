import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticationDto } from './dtos/authentication.dto';
import { Public } from '@/commons/decorators/public.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('authenticate')
  async authenticateUser(
    @Body() jsonToken: AuthenticationDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) { // Use any type for Fastify response
    const { accessToken, refreshToken } = await this.authService.authenticateUser(jsonToken);

    res.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    return { accessToken };
  }

  @Public()
  @Post('register')
  registerUser(@Body() createuser: CreateUserDto) {
    return this.authService.registerUser(createuser);
  }

  @Post('refresh')
  refreshToken(@Req() req: FastifyRequest) {
    const refreshToken = req.cookies?.refreshToken;

    return this.authService.validateRefreshToken(refreshToken);
  }

  @Post('logout')
  logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const refreshToken = req.cookies?.refreshToken;

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    return this.authService.logoutUser(refreshToken);

  }
}
