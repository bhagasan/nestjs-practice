import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  create(name: string): Promise<Role> {
    const role = this.rolesRepository.create({ name });
    return this.rolesRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  findOne(id: number): Promise<Role | null> {
    return this.rolesRepository.findOneBy({ id });
  }

  async update(id: number, name: string): Promise<Role> {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new Error('Role not found');
    }
    role.name = name;
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    await this.rolesRepository.delete(id);
  }
}
