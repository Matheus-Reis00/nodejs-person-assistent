import { Body, Controller, HttpCode, HttpStatus, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserRequestDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService
    ) { }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async login(
        @Body() body: CreateUserRequestDto
    ): Promise<any> {
        return this.userService.getUserByName(body.user.name, body.user.password)
    }

    @Post('/create')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createUser(
        @Body() body: CreateUserRequestDto
    ): Promise<any> {
        return this.userService.addToDatabase('Usuarios', body.user)
    }
}
