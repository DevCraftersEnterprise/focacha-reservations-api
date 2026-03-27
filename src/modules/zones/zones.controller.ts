import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@Controller('zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) { }

  @Get()
  @Roles(Role.ADMIN, Role.CASHIER)
  findAll() {
    return this.zonesService.findAll();
  }

  @Get('branch/:branchId')
  @Roles(Role.ADMIN, Role.CASHIER)
  findByBranch(@Param('branchId', ParseUUIDPipe) branchId: string) {
    return this.zonesService.findByBranchId(branchId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CASHIER)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.zonesService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateZoneDto: UpdateZoneDto) {
    return this.zonesService.update(id, updateZoneDto);
  }

  @Patch(':id/restore')
  @Roles(Role.ADMIN)
  restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.zonesService.restore(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.zonesService.remove(id);
  }
}
