import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import slugify from './slugify';
import { ConfigService } from '@nestjs/config';

export type sheetNames = string
export type despesaCampos = {
    id: string
    user_id: string
    title: string
    mes: string
    ano: string
    total_parcelas: string
    valor_parcela: string
    valor_total: string
    tipo_pagamento: string
    parcela_atual: string
}

export type usuarioCampos = {
    id: string
    name: string
    password: string
}

export type cartaoCampos = {
    id: string
    user_id: string
    name: string
    slug: string
    dia_vencimento: number
}

@Injectable()
export class SheetsService {
    private spreadsheetId: string | undefined;
    private sheets: sheets_v4.Sheets;

    constructor(private configService: ConfigService) {
        const spreadsheetId = this.configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID');
        const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');
        const privateKeyId = this.configService.get<string>('GOOGLE_PRIVATE_KEY_ID');
        const privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY');
        const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const clientX509CertUrl = this.configService.get<string>('GOOGLE_CLIENT_X509_CERT_URL');

        this.spreadsheetId = spreadsheetId;

        // Verificação detalhada para o Render
        const missingEnvs: string[] = [];
        if (!spreadsheetId) missingEnvs.push('GOOGLE_SHEETS_SPREADSHEET_ID');
        if (!privateKey) missingEnvs.push('GOOGLE_PRIVATE_KEY');
        if (!clientEmail) missingEnvs.push('GOOGLE_CLIENT_EMAIL');

        if (missingEnvs.length > 0) {
            console.error(`[SheetsService] ERRO: As seguintes variáveis de ambiente estão FALTANDO: ${missingEnvs.join(', ')}`);
        }

        // Limpeza profunda da Private Key (Essencial para OpenSSL 3 no Render/Linux)
        let formattedPrivateKey = privateKey;
        if (formattedPrivateKey) {
            formattedPrivateKey = formattedPrivateKey.trim();
            // Remove aspas duplas externas se existirem
            if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
                formattedPrivateKey = formattedPrivateKey.substring(1, formattedPrivateKey.length - 1);
            }
            // Converte \n literais (string) em quebras de linha reais
            formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
            // Remove escapes de aspas duplas internas
            formattedPrivateKey = formattedPrivateKey.replace(/\\"/g, '"');
        }

        const credentials = {
            type: "service_account",
            project_id: projectId,
            private_key_id: privateKeyId,
            private_key: formattedPrivateKey,
            client_email: clientEmail,
            client_id: clientId,
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: clientX509CertUrl,
            universe_domain: "googleapis.com"
        };

        if (clientEmail && formattedPrivateKey) {
            try {
                // Usando a forma síncrona de configuração para evitar que this.sheets fique indefinido
                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                // Criamos o objeto sheets imediatamente usando o auth
                this.sheets = google.sheets({ version: 'v4', auth });
                console.log('[SheetsService] Google Sheets Client configurado.');

                // Log de segurança para conferir o formato da chave (apenas metadados)
                console.log(`[SheetsService] Key info: ${formattedPrivateKey.substring(0, 25)}... (Length: ${formattedPrivateKey.length})`);
            } catch (err) {
                console.error('[SheetsService] Erro ao configurar Google Auth:', err.message);
            }
        } else {
            console.error('[SheetsService] Abortando: client_email ou private_key ausentes.');
        }
    }

    async updateCell(sheetName: sheetNames, rowNumber: number, value: any[]) {
        const range = `${sheetName}!A${rowNumber}:${String.fromCharCode(64 + value.length)}${rowNumber}`;

        const response = await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range,
            valueInputOption: 'RAW', // ou 'USER_ENTERED'
            requestBody: {
                values: [value],
            },
        });

        return response.data;
    }

    async addColumn(sheetName: sheetNames, columnTitle: string) {
        // Obter os dados atuais
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}`,
        });

        const rows = response.data.values || [];
        const updatedRows = rows.map((row, i) => {
            row = row || [];
            if (i === 0) {
                // Primeira linha = cabeçalho
                row.push(columnTitle);
            } else {
                row.push(''); // valor vazio por padrão
            }
            return row;
        });

        // Atualiza o conteúdo da planilha inteira
        await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: sheetName,
            valueInputOption: 'RAW',
            requestBody: {
                values: updatedRows,
            },
        });

        return { message: `Coluna "${columnTitle}" adicionada com sucesso.` };
    }

    async addRow(sheetName: sheetNames, rowData: despesaCampos | usuarioCampos | cartaoCampos, idNewElement?: string): Promise<any> {
        const range = `${sheetName}`;
        const timesStampId = idNewElement || new Date().getTime().toString();

        let values: any[][] = [];

        if ('password' in rowData) {
            // Usuario
            values = [[timesStampId, rowData.name, rowData.password]];
        } else if (sheetName === 'Cartoes') {
            // Cartao
            const c = rowData as cartaoCampos;
            values = [[timesStampId, c.user_id, c.name, c.slug, c.dia_vencimento]];
        } else {
            // Despesa
            const d = rowData as despesaCampos;
            values = [[
                timesStampId,
                d.user_id,
                d.title,
                d.tipo_pagamento,
                d.mes,
                d.ano,
                d.total_parcelas,
                d.parcela_atual,
                d.valor_parcela,
                d.valor_total || d.valor_parcela
            ]];
        }

        const response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values,
            },
        });

        return {
            message: 'Linha adicionada com sucesso.',
            updates: response.data.updates,
        };
    }

    async deleteRow(sheetName: sheetNames, id: string): Promise<any> {
        return this.deleteRows(sheetName, id);
    }

    async deleteRows(sheetName: sheetNames, id: string): Promise<any> {
        // Obter os dados atuais para encontrar os índices das linhas
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}!A:A`, // Só precisamos da primeira coluna (ID)
        });

        const rows = response.data.values || [];
        const rowIndices = rows
            .map((row, index) => (row[0] === id ? index : -1))
            .filter(index => index !== -1)
            .sort((a, b) => b - a); // Ordenar do maior para o menor para deletar sem mudar os índices das anteriores

        if (rowIndices.length === 0) {
            throw new Error('Registro não encontrado');
        }

        // Para deletar, precisamos do ID da aba (sheetId), não do nome
        const sheetMetadata = await this.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId,
        });

        const sheet = sheetMetadata.data.sheets?.find(s => s.properties?.title === sheetName);
        if (!sheet) {
            throw new Error('Aba não encontrada');
        }

        const sheetId = sheet.properties?.sheetId;

        const requests = rowIndices.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1,
                },
            },
        }));

        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                requests,
            },
        });

        return { message: `${rowIndices.length} linha(s) deletada(s) com sucesso.` };
    }

    async readSheet(sheetName: sheetNames): Promise<any[][]> {
        const result = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}`,
        });

        let formatedValue: any[] = []

        const data = result.data.values

        if (data?.length) {
            const keys = data[0]

            data.slice(1, data?.length).forEach((item, index) => {
                const itemToArray = {}
                keys.forEach((key, indexKey) => {
                    if (!!item[indexKey])
                        itemToArray[slugify(key)] = item[indexKey]?.includes(", ") ? item[indexKey]?.split(", ") : sheetName === 'Usuarios' ? item[indexKey] : [item[indexKey]]
                })

                formatedValue.push(itemToArray)
            })
        }


        return formatedValue || [];
    }
}