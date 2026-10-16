import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '../auth.service';
import { RedisService } from '@/modules/redis/redis.service';

describe('AuthService', () => {
  let service: AuthService;

  const jwtMock = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const prismaMock = {
    users: { findFirst: jest.fn() },
    users_tokens: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ttl: jest.fn(),
    incrementWithTtl: jest.fn(),
  };

  const configMock = { get: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateRefreshToken', () => {
    const sessionUser = {
      id: 'user-1',
      email: 'cajera@caja.io',
      forenames: 'Ana',
      surnames: 'Pérez',
      nid: '11111111-1',
      user_roles: [],
      entity_users: [],
    };

    beforeEach(() => {
      jwtMock.verify.mockResolvedValue(true);
      jwtMock.decode.mockResolvedValue({ sub: 'user-1' });
      jwtMock.sign.mockReturnValue('access-token');
      redisMock.get.mockResolvedValue('refresh-token');
      prismaMock.users_tokens.findFirst.mockResolvedValue(null);
      prismaMock.users.findFirst.mockResolvedValue(sessionUser);
    });

    it('returns the accessToken and the session user', async () => {
      const result = await service.validateRefreshToken('refresh-token');

      expect(result).toMatchObject({
        accessToken: 'access-token',
        user: sessionUser,
      });
      expect(prismaMock.users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('rejects a revoked refresh token without loading the user', async () => {
      redisMock.get.mockResolvedValue(null);

      await expect(
        service.validateRefreshToken('refresh-token'),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.users.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('logoutUser', () => {
    it('revokes the refresh token in Redis and the stored token in DB', async () => {
      await service.logoutUser('user-1');

      expect(redisMock.del).toHaveBeenCalledWith('caja:refresh:user-1');
      expect(prismaMock.users_tokens.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        data: { is_revoked: true },
      });
    });
  });
});
