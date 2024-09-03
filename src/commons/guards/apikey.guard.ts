import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { API_KEY_HEADER, IS_PUBLIC_KEY } from '../constants/constants';
import { AppConfigService } from '@/config/app/app-config.service';
import { AppConfig } from '@/config/app/enums/app-config.enum';

@Injectable()
export class ApikeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private appConfigService: AppConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPblic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPblic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers[API_KEY_HEADER.toLocaleLowerCase()];
    const apiKey = this.appConfigService.get(AppConfig.API_KEY);
    const isAuth = authHeader === apiKey;
    if (!isAuth) {
      throw new UnauthorizedException(`you don't have permissions to access`);
    }
    return isAuth;
  }
}
