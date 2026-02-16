import { Module } from '@nestjs/common';
import { CartoesController } from './cartoes.controller';
import { CartoesService } from './cartoes.service';

@Module({
    controllers: [CartoesController],
    providers: [CartoesService],
})
export class CartoesModule { }
