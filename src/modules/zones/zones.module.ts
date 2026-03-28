import { Module } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { BranchesModule } from '@modules/branches/branches.module';

@Module({
  imports: [TypeOrmModule.forFeature([Zone]), BranchesModule],
  controllers: [ZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}
