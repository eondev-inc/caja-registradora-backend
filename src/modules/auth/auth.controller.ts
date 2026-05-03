import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticationDto } from './dtos/authentication.dto';
import { Public } from '@/commons/decorators/public.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';
import { Cookies } from '@/commons/decorators/cookies.decorator';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { APP_URL_PREFIX } from '@/commons/constants/constants';

@Controller('auth')
export class AuthController {
  /** Path de la cookie: siempre el mismo prefix global + endpoint de refresh */
  private readonly refreshCookiePath = `${APP_URL_PREFIX}/auth/refresh`;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Construye las opciones de cookie del refresh token a partir de la configuración.
   * Centraliza la lógica para no duplicarla entre authenticate y refresh.
   */
  private buildRefreshCookieOptions() {
    const ttlDays = this.configService.get<number>(AppConfig.JWT_REFRESH_TTL_DAYS) ?? 7;
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      // secure solo en producción — en dev HTTP la cookie igual se envía
      secure: isProduction,
      // strict en prod; lax en dev para evitar problemas con dominios .local
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      // maxAge en SEGUNDOS (spec de cookies usa segundos, no milisegundos)
      maxAge: ttlDays * 24 * 60 * 60,
      path: this.refreshCookiePath,
    };
  }

  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticateUser(
    @Body() jsonToken: AuthenticationDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.authenticateUser(jsonToken);

    res.setCookie('refreshToken', refreshToken, this.buildRefreshCookieOptions());

    return { accessToken, user };
  }

  @Public()
  @Post('register')
  registerUser(@Body() createuser: CreateUserDto) {
    return this.authService.registerUser(createuser);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { accessToken } = await this.authService.validateRefreshToken(refreshToken);

    // Rotar la cookie: extender lifetime con cada refresh exitoso
    res.setCookie('refreshToken', refreshToken, this.buildRefreshCookieOptions());

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    res.clearCookie('refreshToken', { path: this.refreshCookiePath });

    return this.authService.logoutUser(refreshToken);
  }
}
