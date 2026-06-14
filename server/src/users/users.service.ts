import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/CreateUser.dto';
import { SetUserDto } from './dto/SetUser.dto';
import { AdminEditUserDto } from './dto/AdminEditUser.dto';
import * as argon2 from 'argon2';

type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';


const userSelect = {
      id: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
      createdAt: true,
  };

const userSelectWithStatus = {
      id: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
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
            // Admin-created accounts are immediately active; no approval needed.
            accountStatus: 'ACTIVE',
            // Force the user to change this temporary password on first login.
            mustChangePassword: true,
        },
        select: userSelect,
    });
  }

  // Edit a user's profile (admin) — name, email, or set a new temporary password
  async adminEditUser(id: string, dto: AdminEditUserDto): Promise<Partial<User>> {
    const data: Record<string, unknown> = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim() || null;
    }

    if (dto.email !== undefined) {
      const trimmed = dto.email.trim().toLowerCase();
      // Ensure email uniqueness
      const existing = await this.prisma.user.findUnique({ where: { email: trimmed } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email is already in use');
      }
      data.email = trimmed;
    }

    if (dto.password !== undefined) {
      data.passwordHash = await argon2.hash(dto.password);
      // Force user to change this temporary password on next login
      data.mustChangePassword = true;
    }

    if (Object.keys(data).length === 0) {
      const user = await this.prisma.user.findUnique({ where: { id }, select: userSelect });
      if (!user) throw new NotFoundException('User not found');
      return user;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  // Find all users
  async findAll(): Promise<Partial<User>[]>{
    return this.prisma.user.findMany({
        select: userSelect,
    });
  }

  // Search users by name or email (case-insensitive) - ADMIN ONLY
  async searchUsers(query: string): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      where: query
        ? {
            OR: [
              { fullName: { contains: query } },
              { email: { contains: query } },
            ],
          }
        : undefined,
      select: userSelect,
      orderBy: { fullName: 'asc' },
      take: 50,
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

  // Delete user by id - ADMIN ONLY
  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  // Find users by account status - ADMIN ONLY
  async findByAccountStatus(status: AccountStatus): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      where: { accountStatus: status },
      select: userSelectWithStatus,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Update a user's account status - ADMIN ONLY
  async updateAccountStatus(id: string, status: AccountStatus): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data: { accountStatus: status },
      select: userSelectWithStatus,
    });
  }

}
