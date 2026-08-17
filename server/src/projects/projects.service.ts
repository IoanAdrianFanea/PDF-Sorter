import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/CreateProject.dto';
import { UpdateProjectDto } from './dto/UpdateProject.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List projects visible to the caller.
   * Admins always see every project; non-admins only see projects they are a member of,
   * for both the default and the `uploadable` scope.
   */
  async listProjects(
    userId: string,
    scope: 'all' | 'uploadable' = 'all',
  ): Promise<
    Array<{
      id: string;
      name: string;
      createdAt: Date;
      _count: { memberships: number };
    }>
  > {
    // `scope` is kept for backwards compatibility: `all` and `uploadable` now resolve
    // identically, because membership is what determines visibility either way.
    void scope;

    const projectSelect = {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === UserRole.ADMIN) {
      return this.prisma.project.findMany({
        select: projectSelect,
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
      select: projectSelect,
      orderBy: { name: 'asc' },
    });
  }

  async createProject(CreateProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: CreateProjectDto.name,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { memberships: true } },
      },
    });
  }

  async deleteProject(id: string) {
    await this.prisma.projectMembership.deleteMany({
      where: { projectId: id },
    });
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async updateProjectName(id: string, UpdateProjectDto: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: { name: UpdateProjectDto.name },
    });
  }

  async getProjectMembers(id: string) {
    return this.prisma.projectMembership.findMany({
      where: { projectId: id },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }

  async addProjectMember(id: string, userId: string) {
    return this.prisma.projectMembership.create({
      data: {
        projectId: id,
        userId,
      },
    });
  }

  async removeProjectMember(id: string, userId: string) {
    return this.prisma.projectMembership.deleteMany({
      where: {
        projectId: id,
        userId,
      },
    });
  }

  async getProject(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        memberships: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }
}
