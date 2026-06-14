import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';
import { ProfileDto } from './dto/UpdateMe.dto';

// JWT token payload structure
interface JwtPayload {
  sub: string; // User ID
  email: string;
}

// Return type for auth endpoints (access token + refresh token)
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}

// Return type for registration (no tokens — user starts as PENDING)
export interface RegisterResult {
  message: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // Create new user account — returns pending message, no tokens issued
  async register(dto: RegisterDto): Promise<RegisterResult> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(dto.password);

    // Generate email verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Create user (accountStatus defaults to PENDING via schema)
    await this.usersService.create(dto.email, passwordHash, tokenHash);

    // Send verification email to the user (fire-and-forget — never fails the request)
    void this.emailService.sendVerificationEmail(dto.email, rawToken);

    // Notify all admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
    });
    void this.emailService.sendAdminApprovalNotification(
      dto.email,
      admins.map((a) => a.email),
    );

    return { message: 'Registration submitted. Please check your email to verify your address. An admin will then review your request.' };
  }

  // Authenticate existing user
  async login(dto: LoginDto): Promise<AuthTokens> {
    // Find user
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification — must verify before login is allowed
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email address before signing in. Check your inbox for the verification link.');
    }

    // Check account status — block access before issuing tokens
    if (user.accountStatus === 'PENDING') {
      throw new ForbiddenException('Your account is pending admin approval. You will be notified once access is granted.');
    }
    if (user.accountStatus === 'REJECTED') {
      throw new ForbiddenException('Your access request has been rejected. Please contact an administrator.');
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  // Exchange refresh token for new access token (token rotation)
  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    // Verify and decode refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Note: We don't hash the incoming token to search DB
    // We search by userId and then verify against stored hash

    // Find the most recent non-revoked, non-expired refresh token for this user
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    // Verify token hash matches
    const isTokenValid = await argon2.verify(storedToken.tokenHash, refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Get user
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens (token rotation)
    return this.generateTokens(user);
  }

  // Revoke all refresh tokens for user (logout from all devices)
  async logout(userId: string): Promise<void> {
    // Revoke all active refresh tokens for the user
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  // Verify user exists (called by JWT strategy)
  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Generate access token (short-lived) and refresh token (long-lived)
  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') || '15m',
      } as any,
    );

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d',
      } as any,
    );

    // Hash refresh token before storing
    const tokenHash = await argon2.hash(refreshToken);

    // Calculate expiration date
    const expirationString = this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d';
    const expiresAt = this.calculateExpirationDate(expirationString);

    // Store hashed refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, mustChangePassword: user.mustChangePassword };
  }

  // Convert expiration string (e.g., '7d', '15m') to Date object
  private calculateExpirationDate(expirationString: string): Date {
    const value = parseInt(expirationString);
    const unit = expirationString.slice(-1);

    const now = new Date();

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        throw new BadRequestException('Invalid expiration format');
    }
  }

  // Verify email address using the raw token from the email link
  async verifyEmail(rawToken: string): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: tokenHash },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification link.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null, // clear — single-use
      },
    });

    return { message: 'Email verified successfully. You can now sign in once your account is approved.' };
  }

  // Change own password (requires current password)
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    const newHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    // Revoke all refresh tokens so the user re-authenticates cleanly
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async updateMe(userId: string, dto: ProfileDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.usersService.findById(userId);
    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    const data: {
      fullName?: string | null;
      language?: string;
      timezone?: string;
    } = {};

    if (dto.fullName !== undefined) {
      const trimmed = dto.fullName.trim();
      data.fullName = trimmed.length > 0 ? trimmed : null;
    }

    if (dto.language !== undefined) {
      data.language = dto.language.trim();
    }

    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone.trim();
    }

  // If PATCH body is empty, return current profile safely.
    if (Object.keys(data).length === 0) {
      const { passwordHash, ...safeUser } = existingUser;
      return safeUser;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash, ...safeUser } = updatedUser;
    return safeUser;
  }
}
