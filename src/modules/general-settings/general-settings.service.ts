import { Injectable } from '@nestjs/common';
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
  async getPaymentMethods() {
    return await this.prismaService.payment_method.findMany();
  }

  /**
   * Retrieves all transaction types.
   * @returns A promise that resolves to an array of transaction types.
   */
  async getTransactionTypes() {
    return await this.prismaService.transaction_type.findMany();
  }

  /**
   * Retrieves all previsions.
   * @returns A promise that resolves to an array of previsions.
   */
  async getPrevisions() {
    return await this.prismaService.previsions.findMany();
  }
}
