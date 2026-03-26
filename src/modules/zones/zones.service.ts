import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Zone } from './entities/zone.entity';
import { IsNull, Repository } from 'typeorm';
import { BranchesService } from '@modules/branches/branches.service';

@Injectable()
export class ZonesService {

  constructor(
    @InjectRepository(Zone)
    private readonly zonesRepository: Repository<Zone>,
    private readonly branchesService: BranchesService
  ) { }

  async findById(id: string): Promise<Zone | null> {
    return this.zonesRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        branch: true
      }
    });
  }

  async findAll(): Promise<Zone[]> {
    return this.zonesRepository.find({
      where: { deletedAt: IsNull() },
      relations: { branch: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findByBranchId(branchId: string): Promise<Zone[]> {
    return this.zonesRepository.find({
      where: { branchId, deletedAt: IsNull() },
      relations: { branch: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findByIdAndBranchId(id: string, branchId: string): Promise<Zone | null> {
    return this.zonesRepository.findOne({
      where: { id, branchId, deletedAt: IsNull() },
      relations: { branch: true }
    });
  }

  async create(createZoneDto: CreateZoneDto): Promise<Zone> {
    const branch = await this.branchesService.findById(createZoneDto.branchId);

    if (branch) {
      throw new NotFoundException('Branch not found');
    }

    const existing = await this.zonesRepository.findOne({
      where: {
        name: createZoneDto.name,
        branchId: createZoneDto.branchId,
        deletedAt: IsNull()
      }
    });

    if (existing) {
      throw new ConflictException('Zone with the same name already exists in this branch');
    }

    const zone = this.zonesRepository.create(createZoneDto);

    return await this.zonesRepository.save(zone);
  }

  async update(id: string, updateZoneDto: UpdateZoneDto): Promise<Zone> {
    const zone = await this.findById(id);

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    const targetBranchId = updateZoneDto.branchId ?? zone.branchId;
    const targetName = updateZoneDto.name ?? zone.name;

    if (updateZoneDto.branchId !== undefined) {
      const branch = await this.branchesService.findById(updateZoneDto.branchId);

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
    }

    const existing = await this.zonesRepository.findOne({
      where: {
        name: targetName,
        branchId: targetBranchId!,
        deletedAt: IsNull()
      }
    });

    if (existing && existing.id !== zone.id) {
      throw new ConflictException('Zone with the same name already exists in this branch');
    }

    Object.assign(zone, updateZoneDto);

    return await this.zonesRepository.save(zone);
  }

  async remove(id: string): Promise<void> {
    const zone = await this.findById(id);

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    await this.zonesRepository.softRemove(zone);
  }

  async restore(id: string): Promise<void> {
    await this.zonesRepository.restore(id);
  }
}
