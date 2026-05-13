import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import { SetUserDto } from './dto/SetUser.dto';
import * as argon2 from 'argon2';


const userSelect = {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
  };

// Service for user database operations
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Find user by email address
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // For auth internal use - returns full user including passwordHash
  async findById(id: string): Promise<User | null> {
      return this.prisma.user.findUnique({
          where: { id },
      });
  }

// For controller responses - returns safe user without sensitive fields
  async findByIdSafe(id: string): Promise<Partial<User> | null> {
      return this.prisma.user.findUnique({
          where: { id },
          select: userSelect,
      });
  }

  // Create new user with hashed password - REGISTERING
  async create(email: string, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: '',
        role: 'USER',
      },
    });
  }

  // Create new user with hashed password - ADMIN ONLY
  async createUser(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const passwordHash = await argon2.hash(createUserDto.password);
    return this.prisma.user.create({
        data: {
            email: createUserDto.email,
            passwordHash,
            fullName: createUserDto.fullName,
            role: createUserDto.role,
        },
        select: userSelect,
    });
  }

  // Find all users
  async findAll(): Promise<Partial<User>[]>{
    return this.prisma.user.findMany({
        select: userSelect,
    });
  }

  // Update user role
  async setUserRole(id: string, setUserDto: SetUserDto): Promise<Partial<User>> {
    return this.prisma.user.update({
        where: { id },
        data: { role: setUserDto.role },
        select: userSelect,
    });
  }


}
