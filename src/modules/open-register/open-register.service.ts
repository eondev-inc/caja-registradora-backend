import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    const openRegister = await this.prismaService.open_register.findUnique({
      where: { id },
      include: {
        cash_register: true,
        cashiers: true,
      },
    });
    if (!openRegister) {
      throw new NotFoundException(`Open register with ID ${id} not found`);
    }
    return openRegister;
  }

  /**
   * Method to get open register by cashier
   * @param userId string
   * @returns Promise<OpenRegister>
   * @throws NotFoundException if no open register is found for the user
   */
  async getOpenRegisterByUser(userId: string): Promise<OpenRegister> {
    const openRegister = await this.prismaService.open_register.findFirst({
      where: { users: { id: userId } },
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
    createOpenRegister: CreateOpenRegisterDto,
  ): Promise<OpenRegister> {
    try {
      //Fetch the user to get the branch_code
      const user = await this.prismaService.users.findFirst({
        where: { user_id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      //Create a new cashier record if not exists in cashier for the same user
      const cashier = await this.prismaService.cashiers.findFirst({
        where: { users: { id: user.id } },
      });
      if (!cashier) {
        await this.prismaService.cashiers.create({
          data: {
            users: { connect: { id: user.id } },
          },
        });
      }

      //Create a new cash_register record
      const cashRegister = await this.prismaService.cash_register.create({
        data: {
          branch_code: user.branch_code,
          status: true,
        },
      });

      // Find is there any open register for the user
      const openRegister = await this.prismaService.open_register.findFirst({
        where: {
          users: { id: user.id },
          status: register_status_enum.ABIERTO,
        },
      });

      if (openRegister) {
        throw new BadRequestException('There is already an open register');
      }
      //Create a new open_register record
      return await this.prismaService.open_register.create({
        data: {
          initial_cash: createOpenRegister.initial_amount,
          shift_init: new Date().toISOString(),
          users: { connect: { id: user.id } },
          cash_register: { connect: { id: cashRegister.id } },
          cashiers: { connect: { id: cashier.id } },
        },
      });
    } catch (error) {
      this.logger.error('Failed to create open register', error);
      throw new BadRequestException(error);
    }
  }
}
