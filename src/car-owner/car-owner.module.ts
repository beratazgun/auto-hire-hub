import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CsrfManagerService } from '@src/core/services/CsrfManager.service';
import { PrismaService } from '@src/core/services/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, CsrfManagerService, ConfigService],
})
export class CarOwnerModule {}
