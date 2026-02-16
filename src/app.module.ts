import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DespesasModule } from './despesas/despesas.module';
import { CartoesModule } from './cartoes/cartoes.module';

@Module({
  imports: [UsersModule, DespesasModule, CartoesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
