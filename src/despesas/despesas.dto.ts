import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested
} from 'class-validator';


export class DespesaDto {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  user_id: string;
  @IsString()
  @IsNotEmpty()
  title: string
  @IsString()
  @IsNotEmpty()
  mes: string
  @IsString()
  @IsNotEmpty()
  ano: string
  @IsString()
  @IsNotEmpty()
  total_parcelas: string
  @IsString()
  @IsNotEmpty()
  valor_parcela: string
  @IsString()
  @IsNotEmpty()
  valor_total: string
  @IsString()
  @IsNotEmpty()
  tipo_pagamento: string;
  @IsString()
  @IsNotEmpty()
  parcela_atual: string;
}

export class CreateDespesaDto {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => DespesaDto)
  despesa: DespesaDto;
}

export const MesReferencia = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Pode vir de query ou param (ajuste conforme precisar)
    const mesReferencia = request.query['mes-referencia'] || request.params['mesReferencia'];

    // Regex para validar formato YYYY-MM
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!mesReferencia || !regex.test(mesReferencia)) {
      throw new BadRequestException('O parâmetro "mes-referencia" deve estar no formato YYYY-MM (ex: 2025-08)');
    }

    return mesReferencia;
  },
);