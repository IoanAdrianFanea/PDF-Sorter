import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProjects(
    userId: string,
    scope: 'all' | 'uploadable' = 'all',
  ): Promise<Array<{ id: string; name: string }>> {
    if (scope === 'uploadable') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role === UserRole.ADMIN) {
        return this.prisma.project.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        });
      }

      return this.prisma.project.findMany({
        where: {
          memberships: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.project.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
