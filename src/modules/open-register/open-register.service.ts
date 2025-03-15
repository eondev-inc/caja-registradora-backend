import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateOpenRegisterDto } from './dtos/create-open-register.dto';
import { open_register as OpenRegister } from '@prisma/client'; 
import { register_status_enum } from '@prisma/client';
import { LoggingConfigService } from '@/config/logging/logging-config.service';

@Injectable()
export class OpenRegisterService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Method to get open register
   * @param id string
   * @returns Promise<OpenRegister>
   * @throws NotFoundException if the open register is not found
   */
  async getOpenRegister(id: string): Promise<OpenRegister> {
    try {
      const openRegister = await this.prismaService.open_register.findUnique({
        where: { id },
        include: {
          entity: true,
        },
      });
      if (!openRegister) {
        throw new NotFoundException(`Open register with ID ${id} not found`);
      }
      return openRegister;
    } catch (error) {
      throw new BadRequestException(error, 'Failed to get open register');
    }
  }

  /**
   * Method to get open register by cashier
   * @param userId string
   * @returns Promise<OpenRegister>
   * @throws NotFoundException if no open register is found for the user
   */
  async getOpenRegisterByUser(userId: string, entityId: string): Promise<OpenRegister> {
    const openRegister = await this.prismaService.open_register.findFirst({
      where: {
        status: register_status_enum.ABIERTO,
        created_by: userId,
        cash_entity_id: entityId,
      },
    });
    if (!openRegister) {
      throw new NotFoundException(
        `No open register found for user with ID ${userId}`,
      );
    }
    return openRegister;
  }

  /**
   * Method to create open register
   * @param userId string
   * @param createOpenRegister CreateOpenRegisterDto
   * @returns Promise<OpenRegister>
   * @throws BadRequestException if the creation fails
   */
  async createOpenRegister(
    userId: string,
    { initial_amount, entity_id }: CreateOpenRegisterDto,
  ): Promise<OpenRegister> {
    try {
      
      //Fetch the user to get the entity ID
      const user = await this.prismaService.users.findFirst({
        where: { 
          id: userId,
          status: true,
          entity_users: {
            some: {
              entity_id: entity_id,
              status: true,
            }
          }
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Find is there any open register for the user
      const openRegister = await this.prismaService.open_register.findFirst({
        where: {
          users: { id: user.id },
          entity: { id: entity_id },
          status: register_status_enum.ABIERTO,
        },
      });

      if (openRegister) {
        throw new BadRequestException('There is already an open register');
      }
      //Create a new open_register record
      return await this.prismaService.open_register.create({
        data: {
          initial_cash: initial_amount,
          shift_init: new Date().toISOString(),
          users: { connect: { id: user.id } },
          entity: { connect: { id: entity_id } },
        },
      });
    } catch (error) {
      this.logger.error('Failed to create open register', error);
      throw new BadRequestException('Failed to create open register', error);
    }
  }
}
