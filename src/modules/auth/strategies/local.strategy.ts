import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    // Passport local espera 'username' por defecto — sobreescribimos al campo email
    super({ usernameField: 'email', passwordField: 'password' });
  }

  /**
   * Passport local llama validate(username, password) — NO un DTO.
   * La signature incorrecta anterior (validate(token: AuthenticationDto))
   * hacía que password llegara siempre como undefined.
   * @param email - Email extraído del body por Passport.
   * @param password - Password extraído del body por Passport.
   * @returns El resultado de authenticateUser si las credenciales son válidas.
   * @throws UnauthorizedException si las credenciales son incorrectas.
   */
  async validate(email: string, password: string) {
    const result = await this.authService.authenticateUser({ email, password });
    if (!result) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return result;
  }
}
