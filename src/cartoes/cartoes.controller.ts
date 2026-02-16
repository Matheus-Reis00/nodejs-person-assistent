import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CartoesService } from './cartoes.service';
import { CreateCartaoDto, UpdateCartaoDto } from './cartoes.dto';

@Controller('cartoes')
export class CartoesController {
    constructor(private readonly cartoesService: CartoesService) { }

    @Get()
    findAll(@Query('user_id') user_id: string) {
        return this.cartoesService.findAllByUserId(user_id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Query('user_id') user_id: string) {
        return this.cartoesService.findOneById(id, user_id);
    }

    @Post()
    create(@Body() createCartaoDto: CreateCartaoDto) {
        return this.cartoesService.create(createCartaoDto);
    }

    @Put()
    update(@Body() updateCartaoDto: UpdateCartaoDto) {
        return this.cartoesService.update(updateCartaoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('user_id') user_id: string) {
        return this.cartoesService.remove(id, user_id);
    }
}
