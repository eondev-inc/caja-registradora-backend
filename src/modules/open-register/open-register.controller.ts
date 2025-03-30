import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OpenRegisterService } from './open-register.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { users } from '@prisma/client';
import { CreateOpenRegisterDto } from './dtos/create-open-register.dto';
import { JwtAuthGuard } from '@/commons/guards/jwt-auth.guard';

/**
 * Controller for handling open register related operations.
 * Uses PassportJWT for authentication and authorization.
 */
@ApiTags('open-register')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('open-register')
export class OpenRegisterController {
  constructor(private readonly openRegisterService: OpenRegisterService) {}

  /**
   * Retrieves an open register by its ID.
   * @param id - The ID of the open register.
   * @returns The open register details.
   */
  @ApiOperation({ summary: 'Get open register by ID' })
  @ApiResponse({ status: 200, description: 'The open register details.' })
  @ApiResponse({ status: 404, description: 'Open register not found.' })
  @ApiResponse({ status: 400, description: 'Failed to get open register.' })
  @Get(':id')
  async getOpenRegister(@Param('id') id: string) {
    return this.openRegisterService.getOpenRegister(id);
  }

  /**
   * Retrieves open registers associated with the current cashier.
   * @param req - The request object containing user information.
   * @returns The open registers associated with the cashier.
   */
  @ApiOperation({ summary: 'Get open registers by cashier' })
  @ApiResponse({
    status: 200,
    description: 'The open registers associated with the cashier.',
  })
  @ApiResponse({
    status: 404,
    description: 'No open registers found for the cashier.',
  })
  @Get('by-cashier/:entityId')
  async getOpenRegisterByUser(@Req() req, @Param('entityId') entityId: string) {
    const user = req.user as users;
    return this.openRegisterService.getOpenRegisterByUser(user.id, entityId);
  }

  /**
   * Creates a new open register.
   * @param req - The request object containing user information.
   * @param createOpenRegister - The details of the open register to be created.
   * @returns The newly created open register.
   */
  @ApiOperation({ summary: 'Create a new open register' })
  @ApiResponse({ status: 201, description: 'The newly created open register.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Post()
  async createOpenRegister(
    @Req() req,
    @Body() createOpenRegister: CreateOpenRegisterDto,
  ) {
    const user = req.user;
    return await this.openRegisterService.createOpenRegister(
      user.sub,
      createOpenRegister,
    );
  }
}
