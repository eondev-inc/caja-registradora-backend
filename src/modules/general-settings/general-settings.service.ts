import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class GeneralSettinsService {
  constructor(private readonly prisma: PrismaService) {}
  
  getPaymentMethods() {
    return this.prisma.payment_method.findMany();
  }
  
}