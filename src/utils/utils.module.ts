import { Global, Module } from '@nestjs/common';
import { SheetsService } from './Sheets';

@Global()
@Module({
    providers: [SheetsService],
    exports: [SheetsService],
})
export class UtilsModule { }
