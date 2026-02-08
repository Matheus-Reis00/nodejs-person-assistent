import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SheetsService } from 'src/utils/Sheets';

@Injectable()
export class UsersService {
    private sheetsService = new SheetsService()
    constructor() {
    }

    async getUserByName(userName: string, userPassword: string): Promise<any> {
        const users = await this.sheetsService.readSheet('Usuarios')
        const userFind: any = users.find((user: any) => user?.name === userName) || null

        if (userFind) {
            if (userPassword === userFind.password) {
                return userFind
            } else {
                throw new UnauthorizedException('Senha incorreta')
            }
        }

         throw new UnauthorizedException('Usuário não encontrado')
    }

    async addToDatabase(database: string, userToCreate: { name: string, password: string }): Promise<any> {
        const users = await this.sheetsService.readSheet('Usuarios')
        const hasUser: any = users.some((user: any) => user?.name === userToCreate.name)

        if (!hasUser) {
            return await this.sheetsService.addRow(
                database,
                { ...userToCreate, id: userToCreate.name }
            );
        }
        
        return { status: 400, message: 'Usuário já existe' }
    }
}
