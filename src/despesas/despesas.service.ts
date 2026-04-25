import { Injectable } from '@nestjs/common';
import { despesaCampos, SheetsService } from 'src/utils/Sheets';

@Injectable()
export class DespesasService {
    constructor(private sheetsService: SheetsService) {
    }

    async listDespesasUser(user_id: string, mesReferencia: string): Promise<despesaCampos[]> {
        const despesas: any = await this.sheetsService.readSheet("Despesas")

        const ano = mesReferencia.split('-')[0]
        let mes = mesReferencia.split('-')[1]

        if (mes.startsWith("0")) {
            mes = mes.replace("0", "")
        }

        return despesas?.filter((despesa) => despesa?.user_id[0] == user_id && ((despesa?.mes[0] == mes && despesa?.ano[0] == ano) || despesa?.total_parcelas[0] == 'fixa'))?.map((despesa) => {
            return {
                id: despesa?.id[0],
                user_id: despesa?.user_id[0],
                title: despesa?.title[0],
                tipo_pagamento: despesa?.tipo_pagamento[0],
                mes: despesa?.mes[0],
                ano: despesa?.ano[0],
                parcela_atual: !isNaN(despesa?.parcela_atual[0]) ? parseFloat(despesa?.parcela_atual[0]) : despesa?.parcela_atual[0],
                total_parcelas: !isNaN(despesa?.total_parcelas[0]) ? parseFloat(despesa?.total_parcelas[0]) : despesa?.total_parcelas[0],
                valor_parcela: parseFloat(despesa?.valor_parcela[0] === 'fixa' ? despesa?.valor_total[0] : despesa?.valor_parcela[0]),
                valor_total: parseFloat(despesa?.valor_total[0] || despesa?.valor_parcela[0])
            }
        })
    }

    async addToDatabase(database: string, despesaToCreate: despesaCampos): Promise<any> {
        // @ts-ignore
        if (!isNaN(despesaToCreate?.total_parcelas) && parseInt(despesaToCreate.total_parcelas) > 1) {
            const idNewElement = new Date().getTime().toString()
            const promises = Array.from({ length: parseInt(despesaToCreate.total_parcelas) }).map(async (_, index) => {
                let mes = despesaToCreate.mes
                let ano = despesaToCreate.ano
                let parcela_atual = index + 1

                if (mes.startsWith("0")) {
                    mes = mes.replace("0", "")
                }

                if (index > 0) {
                    if (parseInt(mes) + (index) > 12) {
                        ano = (parseInt(ano) + 1).toString()
                        mes = '1'
                    } else {
                        mes = (parseInt(mes) + (index)).toString()
                    }
                }


                return this.sheetsService.addRow(
                    database,
                    { ...despesaToCreate, mes: mes, ano: ano, parcela_atual: parcela_atual.toString() },
                    idNewElement
                );
            })


            const results = await Promise.all(promises);

            return results
        } else {
            return await this.sheetsService.addRow(
                database,
                { ...despesaToCreate, ...(despesaToCreate?.total_parcelas === 'fixa' ? { mes: 'N/A', ano: 'N/A' } : {}) }
            );
        }
    }

    private mountDataToSheet(despesa: despesaCampos): any[] {
        const isFixa = despesa.total_parcelas === 'fixa' || despesa.valor_parcela === 'fixa'

        const data = [despesa.id, despesa.user_id, despesa.title, despesa.tipo_pagamento, isFixa ? 'N/A' : despesa.mes, isFixa ? 'N/A' : despesa.ano, despesa.total_parcelas, despesa.parcela_atual, despesa.valor_parcela, despesa.valor_total]
        return data
    }

    async editDespesa(database: string, despesaToEdit: despesaCampos): Promise<any> {
        // @ts-ignore
        const despesas: any = await this.sheetsService.readSheet(database)

        const despesaLine = despesas.findIndex((despesa) => despesa.id[0] === despesaToEdit.id)

        if (typeof despesaLine === 'number' && despesaLine >= 0) {
            return this.sheetsService.updateCell(database, despesaLine + 2, this.mountDataToSheet(despesaToEdit));
        }

        throw new Error('Despesa não encontrada')
    }

    async editDespesaParcelada(database: string, despesaToEdit: despesaCampos): Promise<any> {
        // @ts-ignore
        const despesas: any = await this.sheetsService.readSheet(database)

        let despesasParceladas: any[] = []

        despesas.forEach((despesa, index) => {
            if (despesa.id[0] === despesaToEdit.id) {
                despesasParceladas.push([despesa, index])
            }
        })

        despesasParceladas = despesasParceladas.map(([despesa, index]) => {
            const formatedDespesa = Object.keys(despesa).reduce((acc, key) => {
                acc[key] = despesa[key][0]
                return acc
            }, {} as despesaCampos)

            return [formatedDespesa, index]
        })

        console.log(despesasParceladas)

        return await Promise.all(despesasParceladas.map(([despesa, index]) => {
            return this.sheetsService.updateCell(database, index + 2, this.mountDataToSheet({ ...despesa, valor_parcela: despesaToEdit.valor_parcela, valor_total: despesaToEdit.valor_total }));
        }))
    }

    async remove(id: string): Promise<any> {
        return await this.sheetsService.deleteRows("Despesas", id);
    }

    async getRelatorioDetalhado(user_id: string, mesReferenciaInicio: string): Promise<any> {
        const despesas: any = await this.sheetsService.readSheet("Despesas");
        const anoInicio = parseInt(mesReferenciaInicio.split('-')[0]);
        const mesInicio = parseInt(mesReferenciaInicio.split('-')[1]);
        
        const despesasUser = despesas?.filter((despesa: any) => despesa?.user_id?.[0] == user_id) || [];
        
        const mesesEAnosProcessar = new Set<string>();
        
        despesasUser.forEach((despesa: any) => {
            if (despesa?.total_parcelas?.[0] !== 'fixa') {
                const ano = parseInt(despesa?.ano?.[0]);
                const mes = parseInt(despesa?.mes?.[0]);
                if (ano > anoInicio || (ano === anoInicio && mes >= mesInicio)) {
                    mesesEAnosProcessar.add(`${ano}-${mes.toString().padStart(2, '0')}`);
                }
            }
        });
        
        let mesesList = Array.from(mesesEAnosProcessar).sort();
        if (mesesList.length === 0) {
            mesesList = [`${anoInicio}-${mesInicio.toString().padStart(2, '0')}`];
        } else {
            const limitStr = mesesList[mesesList.length - 1];
            const limitAno = parseInt(limitStr.split('-')[0]);
            const limitMes = parseInt(limitStr.split('-')[1]);
            
            mesesList = [];
            let currAno = anoInicio;
            let currMes = mesInicio;
            while(currAno < limitAno || (currAno === limitAno && currMes <= limitMes)) {
                mesesList.push(`${currAno}-${currMes.toString().padStart(2, '0')}`);
                currMes++;
                if (currMes > 12) {
                    currMes = 1;
                    currAno++;
                }
            }
        }
        
        const resultadoFinal: any[] = [];
        
        for (const mesAno of mesesList) {
            const [anoStr, mesStr] = mesAno.split('-');
            const anoNum = parseInt(anoStr);
            const mesNum = parseInt(mesStr);
            
            const despesasNesteMes = despesasUser.filter((despesa: any) => {
                const isFixa = despesa?.total_parcelas?.[0] === 'fixa';
                if (isFixa) return true;
                
                return parseInt(despesa?.ano?.[0]) === anoNum && parseInt(despesa?.mes?.[0]) === mesNum;
            });
            
            const porFormaPagamento: Record<string, any> = {};
            let total_consolidado_mes = 0;
            
            despesasNesteMes.forEach((despesa: any) => {
                const tipo = despesa?.tipo_pagamento?.[0] || 'Outros';
                
                const valor_parcela = parseFloat(despesa?.valor_parcela?.[0] === 'fixa' ? despesa?.valor_total?.[0] : despesa?.valor_parcela?.[0]) || 0;
                
                if (!porFormaPagamento[tipo]) {
                    porFormaPagamento[tipo] = {
                        tipo_pagamento: tipo,
                        total_tipo: 0,
                        despesas: []
                    };
                }
                
                porFormaPagamento[tipo].total_tipo += valor_parcela;
                total_consolidado_mes += valor_parcela;
                
                porFormaPagamento[tipo].despesas.push({
                    id: despesa?.id?.[0],
                    title: despesa?.title?.[0],
                    valor_parcela: valor_parcela,
                    total_parcelas: despesa?.total_parcelas?.[0],
                    parcela_atual: despesa?.parcela_atual?.[0],
                });
            });
            
            resultadoFinal.push({
                mesReferencia: mesAno,
                total_consolidado: total_consolidado_mes,
                formas_pagamento: Object.values(porFormaPagamento)
            });
        }
        
        return resultadoFinal;
    }
}
