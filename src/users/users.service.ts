import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role_id: createUserDto.roleId,
    });
    return this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const { roleId, ...updateData } = updateUserDto;

    if (updateData.password && typeof updateData.password === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = this.usersRepository.create({
      ...user,
      ...updateData,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role_id: roleId !== undefined ? roleId : user.role_id,
    });

    return this.usersRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
