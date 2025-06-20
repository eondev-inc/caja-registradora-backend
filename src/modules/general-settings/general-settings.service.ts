import { Injectable } from '@nestjs/common';
import { entity, payment_method, transaction_type } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class GeneralSettingsService {
  /**
   * Creates an instance of GeneralSettingsService.
   * @param prismaService - The Prisma service instance.
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Retrieves all payment methods.
   * @returns A promise that resolves to an array of payment methods.
   */
  async getPaymentMethods(): Promise<payment_method[]> {
    return await this.prismaService.payment_method.findMany();
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

}
