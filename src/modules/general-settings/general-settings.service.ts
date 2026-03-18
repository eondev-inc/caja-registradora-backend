import { Injectable } from '@nestjs/common';
import { entity, payment_method, previsions, professionals, transaction_type } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class GeneralSettingsService {
  /**
   * Creates an instance of GeneralSettingsService.
   * @param prismaService - The Prisma service instance.
   */
  constructor(private readonly prismaService: PrismaService) { }

  /**
   * Retrieves all active payment methods.
   * @returns A promise that resolves to an array of active payment methods.
   */
  async getPaymentMethods(): Promise<payment_method[]> {
    return await this.prismaService.payment_method.findMany({
      where: { status: true },
    });
  }

  /**
   * Retrieves all transaction types.
   * @returns A promise that resolves to an array of transaction types.
   */
  async getTransactionTypes(): Promise<transaction_type[]> {
    return await this.prismaService.transaction_type.findMany();
  }

  /**
   * Retrieves all entities.
   * @returns A promise that resolves to an array of entities.
   */
  async getEntities(): Promise<any> {
    const entities = await this.prismaService.entity.findMany();

    return entities.map((entity) => {
      return {
        id: entity.id,
        name: entity.entity_name,
      };
    });
  }

  /**
   * Retrieves all professionals.
   * @returns A promise that resolves to an array of professionals.
   */
  async getProfessionals(): Promise<Partial<professionals>[]> {
    return await this.prismaService.professionals.findMany({
      where: { status: true },
      select: {
        id: true,
        professional_name: true,
        specialty: true,
        rut: true,
      },
    });
  }

  /**
   * Retrieves all previsions.
   * @returns A promise that resolves to an array of previsions.
   */
  async getPrevisions(): Promise<Partial<previsions>[]> {
    return await this.prismaService.previsions.findMany({
      where: { status: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
    });
  }

}
