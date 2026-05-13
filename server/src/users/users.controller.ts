import { CreateUserDto } from "./dto/CreateUser.dto";
import { SetUserDto } from "./dto/SetUser.dto";;
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Controller, UseGuards, Get, Post, Param, Body, Request, BadRequestException, ForbiddenException } from "@nestjs/common";
import { UsersService } from "./users.service";


@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    // retrieve all users - ADMIN ONLY
    @Get()
    async getUsers( 
        @Request() req
    ) {

        const userRole = req.user?.role;
        if (userRole !== 'ADMIN') {
            throw new BadRequestException('Only admins can access this resource');
        }

        return this.usersService.findAll();
    }

    // update user role - ADMIN ONLY
    @Post(':id/role')
    async setUserRole(
        @Param('id') id: string, @Body() setUserDto: SetUserDto, @Request() req
    ) {

        const userRole = req.user?.role;
        if (userRole !== 'ADMIN') {
            throw new BadRequestException('Only admins can access this resource');
        }
        return this.usersService.setUserRole(id, setUserDto);
    }

    // create new user - ADMIN ONLY
    @Post()
    async createUser(
        @Body() createUserDto: CreateUserDto, @Request() req
    ) {

        const userRole = req.user?.role;
        if (userRole !== 'ADMIN') {
            throw new BadRequestException('Only admins can access this resource');
        }
        return this.usersService.createUser(createUserDto);
    }

    // retrieve user by ID - ALL
    @Get(':id')
        async getUserById(
            @Param('id') id: string, @Request() req
        ) {

        const userId = req.user?.id || req.user?.sub;
        const userRole = req.user?.role;

        if (userRole !== 'ADMIN' && userId !== id) {
            throw new ForbiddenException('You can only access your own profile');
        }

        return this.usersService.findByIdSafe(id);
}

}