import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import slugify from './slugify';

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

@Injectable()
export class SheetsService {
    private spreadsheetId = '1uEOPY_YN99RkT3S4IpSuy3EXEoOEfs3lMNGbsf4leJ0'
    private sheets: sheets_v4.Sheets;

    constructor() {
        const credentials = {
            "type": "service_account",
            "project_id": "smooth-command-462116-b3",
            "private_key_id": "55cc6e92d61e524d234d8fb973cad62b873db4e2",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDtGDHQjB2sE1yp\nBmw1lw8GrDziVvIBomCrEGZgHeHOZL4UIz1uyI7ghk6f67CkFjM8CGKFnlx+nB48\ndduq1YfpiVvBwzhKQOf8BPqHHWg7TM2syIPFCE6bBGAksDuPvB2IhSRP9VmEBAzT\nczxjjIjUZg3/QxGdq1BnhYrbljQJ++vUf0Woe7t+Nx17K2KJFhz0B5F//xYVQ7i1\np4dNjEc4ecxIyK12jwAEvNBF871SwbQYgTqik6dxS05p8wgPVCnE4dK9SgY21+bC\n0B9SFg8eJW36D+wcUuha4BBxiJ2CL13JVkWYT9kHgIsNwnfabYsJeLxyL6gYFr3N\nBJOXe/XhAgMBAAECggEAAL/iRO6zd5A8W1GwkQMOLmsIGn5UP6hy8imALFq91HJl\ntjA2FRID3x53lEp5RYyHKw/6+UGK2PDfCNmFyTKJfmXTdR9sD7KItTeSD/AqLKFR\nl2OvJHXiMzviXq1Ss+GwLXa/ypOrzba6UGcRbF5k7ph3v/xHG4qvi3M88RSmi5dH\nbNyg7qxOvDQpzgsTK1GlV8ZQXF7BWgZIFKHftQdy3TlrtR6GvvL/YLDoGDc0VI4K\nnOCNdjJV1z6kBi8ApoEgRC6Uqb6C+EVT7MX0lvhv1OiOMldnmn9ziR0h/s3b+U9X\n0xcQlpW8tOt8B+PQHmsy0EaUFPofzovW21lzAsJMMQKBgQD3gVVzLDecJwJuNu+p\nnwfl32h0N9OIuS7zD/KRCItPfdxntz9bVSem/1mLpnddgMlbP/KASM52PNSOnMAi\nldr30G5uLc6B0owXMQFvAOpp0whq01xrU1+if9zfmumczNmqCZkXAiGkmTUo1evs\n2l4klJpMOBxLJ+RJZjHW1ACPcQKBgQD1O2OIIZ3kylGiHWImPcOSEn9I6wxPnssM\nBziFBgcLv4ObWUJw0aN87d55hntQSV0SmEGzyZxfDgdeLMUiKiGE+h9oyuJZB1X+\njT6aKv0Xi6iBO204KN92Ra71TH3C837GIkKPeSDLIkz9NXuPu8mcZCrVyToqTMNy\ns4PowY51cQKBgQDAXvwFiqambgOLmpNoqTzARIaxXfrCV/zP2uNUKunsnQzEaD+M\nQ4GQYQQ+cOJyAHmAvRFE+FHQwLMNLXSA7SzGVHCgnmXVrcpI9EQC/Rk1q1rtfN5m\nZOT+LpeEDKnqv6WmbdNZeMShZJtW4/59l7R4hi/vceU73QOosQ+nxBuzYQKBgFh0\nVn9o2MIItA9Ml/WBO8S5hU3w8lzZwxWQmTNqLCpxpu/m708wXs8WIbQl7N7Vx4uI\nfdJyu0OSFNhEP8sF9Vc4vRGYdLJ2Me+CVP1Y2jee+WW74LZsD8ZidiwmrgoeuDCR\ndP65SznaInkGzI3Yx2zwuH6qeZ9+VtVNqRvQjSkRAoGAPJxsYb0c7H1dusfZojfn\nFT+cNIGccFBb0FIn3iy2r/cV4JggUmgkBVOfTx2XuOqwf3uKvX3r/VgNSVodSYot\n6qlKRzazbopRThcOMBpgK7nfciw8omF3WbmCqecw/VQ4GBTz1Bv76lbprj6DGNRR\n/5qFJKJP4aKCHUlRHCZRXU0=\n-----END PRIVATE KEY-----\n",
            "client_email": "person-assistent@smooth-command-462116-b3.iam.gserviceaccount.com",
            "client_id": "102693856304293165383",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/person-assistent%40smooth-command-462116-b3.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        auth.getClient().then((authClient: any) => {
            this.sheets = google.sheets({ version: 'v4', auth: authClient });
        });
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

    async addRow(sheetName: sheetNames, rowData: despesaCampos | usuarioCampos): Promise<any> {
        const range = `${sheetName}`;

        const timesStampId = new Date().getTime()

        const response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                // @ts-ignore
                values: !!rowData?.password ? [[timesStampId, rowData?.name, rowData?.password]] : [[timesStampId, rowData?.user_id, rowData?.title, rowData?.tipo_pagamento, rowData?.mes, rowData?.ano, rowData?.total_parcelas, rowData?.parcela_atual, rowData?.valor_parcela, rowData?.valor_total || rowData?.valor_parcela]],
            },
        });

        return {
            message: 'Linha adicionada com sucesso.',
            updates: response.data.updates,
        };
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