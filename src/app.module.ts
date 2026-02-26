import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DespesasModule } from './despesas/despesas.module';
import { CartoesModule } from './cartoes/cartoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DespesasModule,
    CartoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
