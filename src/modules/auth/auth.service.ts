import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AuthenticationDto } from './dtos/authentication.dto';
import { CreateUsersDto } from '@/generated/prisma/users/dto/create-users.dto';
import { RolesAutentia } from './enum/autentia-rol.enum';
import { Supabase } from '../supabase/supabase.service';
import { AuthResponse } from '@supabase/supabase-js';
import RUT from 'rut-chile';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => Supabase))
    private supabase: Supabase,
  ) {}

  async authenticateUser({ email, password }: AuthenticationDto) {
    // autenticar al usuario contra supabase y obtener el token
    const { data, error } = await this.supabase
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });
    if (error) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // devolver el token de supabase
    return data;
  }

  async registerUser(createuser: CreateUsersDto) {
    // voy a crear un usuario en supabase
    const { data, error }: AuthResponse = await this.supabase
      .getClient()
      .auth.signUp({
        email: createuser.email,
        password: createuser.password,
      });

    if (error) {
      throw new UnauthorizedException('Error al crear el usuario', error);
    }
    //formatear el rut chileno del usuario
    const rut = RUT.validate(createuser.nid)
      ? RUT.deformat(createuser.nid)
      : null;
    if (!rut) {
      throw new ConflictException('Rut inválido');
    }
    // voy a crear un usuario en la base de datos de la aplicación
    return this.prismaService.users.create({
      data: {
        nid: rut,
        user_id: data.user.id,
        ...createuser,
        roles: {
          connect: {
            id: RolesAutentia.ASISTENTE,
          },
        },
      },
    });
  }
}
