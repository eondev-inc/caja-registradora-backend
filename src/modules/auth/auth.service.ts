import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AuthserverService } from './authserver.service';
import { PersonService } from '../person/person.service';
import { AuthenticationDto } from './dtos/authentication.dto';
import { EmAuthserverObject } from './interface/authserver.interface';
import { rutFormat } from '../person/utils/rut.utils';
import { PersonUserDto } from '../person/dtos/person.dto';
import { CreateUsersDto } from '@/generated/prisma/users/dto/create-users.dto';
import { RolesAutentia } from './enum/autentia-rol.enum';
import { TokenService } from './token.service';
import AgendaService from '@/commons/services/agenda.service';
import { Users } from '@/generated/prisma/users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => AuthserverService))
    private readonly autserverService: AuthserverService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => AgendaService))
    private agendaService: AgendaService,
  ) {}

  async authenticateUser({ email, password }: AuthenticationDto) {}

  async registerUser(createuser: CreateUsersDto) {
    const { nid: rutUser } = createuser;
    const rut = rutFormat(rutUser);

    return this.prismaService.users.create({
      data: {
        ...createuser,
        nid: rut,
        roles: {
          connect: {
            id: RolesAutentia.ASISTENTE,
          },
        },
      },
    });
  }
}
