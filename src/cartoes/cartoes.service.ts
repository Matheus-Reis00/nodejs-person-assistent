import { Injectable } from '@nestjs/common';
import { cartaoCampos, SheetsService } from 'src/utils/Sheets';
import { CreateCartaoDto, UpdateCartaoDto } from './cartoes.dto';

@Injectable()
export class CartoesService {
    private sheetsService = new SheetsService();
    private readonly sheetName = 'Cartoes';

    async findAllByUserId(user_id: string): Promise<cartaoCampos[]> {
        const data: any = await this.sheetsService.readSheet(this.sheetName);

        return data
            ?.filter((item: any) => item.user_id[0] === user_id)
            ?.map((item: any) => ({
                id: item.id[0],
                user_id: item.user_id[0],
                name: item.name[0],
                slug: item.slug[0],
                dia_vencimento: parseInt(item.dia_vencimento[0]),
            }));
    }

    async findOneById(id: string, user_id: string): Promise<cartaoCampos> {
        const data: any = await this.sheetsService.readSheet(this.sheetName);
        const card = data?.find((item: any) => item.id[0] === id);

        if (!card) {
            throw new Error('Cartão não encontrado');
        }

        if (card.user_id[0] !== user_id) {
            throw new Error('O cartão não pertence ao usuário');
        }

        return {
            id: card.id[0],
            user_id: card.user_id[0],
            name: card.name[0],
            slug: card.slug[0],
            dia_vencimento: parseInt(card.dia_vencimento[0]),
        };
    }

    async create(createCartaoDto: CreateCartaoDto): Promise<any> {
        const newCartao: cartaoCampos = {
            id: new Date().getTime().toString(),
            ...createCartaoDto,
        };

        return await this.sheetsService.addRow(this.sheetName, newCartao);
    }

    async update(updateCartaoDto: UpdateCartaoDto): Promise<any> {
        const cards: any = await this.sheetsService.readSheet(this.sheetName);
        const cardLine = cards.findIndex((card: any) => card.id[0] === updateCartaoDto.id);

        if (cardLine >= 0) {
            const card = cards[cardLine];

            if (card.user_id[0] !== updateCartaoDto.user_id) {
                throw new Error('O cartão não pertence ao usuário');
            }

            const rowData = [
                updateCartaoDto.id,
                updateCartaoDto.user_id,
                updateCartaoDto.name,
                updateCartaoDto.slug,
                updateCartaoDto.dia_vencimento,
            ];
            // cardLine + 2 because rows are 1-indexed and there's a header
            return await this.sheetsService.updateCell(this.sheetName, cardLine + 2, rowData);
        }

        throw new Error('Cartão não encontrado');
    }

    async remove(id: string, user_id: string): Promise<any> {
        const cards: any = await this.sheetsService.readSheet(this.sheetName);
        const card = cards.find((c: any) => c.id[0] === id);

        if (!card) {
            throw new Error('Cartão não encontrado');
        }

        if (card.user_id[0] !== user_id) {
            throw new Error('O cartão não pertence ao usuário');
        }

        return await this.sheetsService.deleteRow(this.sheetName, id);
    }
}
