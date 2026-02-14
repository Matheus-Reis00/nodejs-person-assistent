import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDespesaDto, EditDespesaDto, MesReferencia } from './despesas.dto';
import { DespesasService } from './despesas.service';

@Controller('despesas')
export class DespesasController {
    constructor(
        private readonly despesaService: DespesasService
    ) { }

    @Get('/')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async getRelatorio(@MesReferencia('mes-referencia') mesReferencia: string, @Query("user_id") user_id: string): Promise<any> {
        if (!user_id) {
            throw new BadRequestException('O parâmetro "user_id" é obrigatório.');
        }

        return this.despesaService.listDespesasUser(user_id, mesReferencia)
    }

    @Post('/')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createDespesa(
        @Body() body: CreateDespesaDto
    ): Promise<any> {
        return this.despesaService.addToDatabase("Despesas", body.despesa)
    }

    @Put('/')
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updateDespesa(
        @Body() body: EditDespesaDto
    ): Promise<any> {
        if (Number(body.despesa.total_parcelas) > 1) {
            return await this.despesaService.editDespesaParcelada("Despesas", body.despesa)
        }
        return await this.despesaService.editDespesa("Despesas", body.despesa)
    }
}
