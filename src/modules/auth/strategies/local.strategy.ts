import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { AuthenticationDto } from '../dtos/authentication.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }
  

  async validate(token: AuthenticationDto) {
    const user = await this.authService.authenticateUser(token);
    if (!user) {
      throw new NotFoundException('Credenciales incorrectas');
    }
    return user;
  }
}
