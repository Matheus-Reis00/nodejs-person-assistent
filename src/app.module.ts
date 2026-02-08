import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DespesasModule } from './despesas/despesas.module';

@Module({
  imports: [UsersModule, DespesasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
