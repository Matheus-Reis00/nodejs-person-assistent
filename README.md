# Node.js Personal Assistant (Financeiro)

Este projeto é um assistente pessoal de controle financeiro desenvolvido com **NestJS**. O diferencial deste sistema é a utilização do **Google Sheets** como banco de dados em tempo real, facilitando a visualização e edição direta dos dados caso necessário.

## 🚀 Funcionalidades

- **Controle de Usuários**: Cadastro e autenticação básica.
- **Gestão de Despesas**:
  - Criar, editar, listar e deletar despesas.
  - Suporte a despesas recorrentes (fixas) e parceladas.
  - Cálculo automático de parcelas e meses de referência.
- **Gestão de Cartões de Crédito**:
  - Criar, editar, listar e deletar cartões vinculados ao usuário.
  - Controle por `user_id` para garantir que um usuário só acesse seus próprios dados.
- **Banco de Dados no Google Sheets**: Integração total com a API do Google Sheets.

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

Além disso, é necessário configurar um projeto no [Google Cloud Console](https://console.cloud.google.com/) para obter as credenciais de acesso à API do Google Sheets.

## ⚙️ Configuração da Planilha

Para o projeto funcionar, sua planilha do Google Sheets deve conter as seguintes abas e colunas:

### 1. Usuarios
Colunas: `id`, `name`, `password`

### 2. Despesas
Colunas: `id`, `user_id`, `title`, `tipo_pagamento`, `mes`, `ano`, `total_parcelas`, `parcela_atual`, `valor_parcela`, `valor_total`

### 3. Cartoes
Colunas: `id`, `user_id`, `name`, `slug`, `dia_vencimento`

> [!TIP]
> Você pode usar o arquivo `person-assistent-base-google-sheets.xlsx` incluído na raiz do projeto para importar a estrutura base para o seu Google Sheets.

**IMPORTANTE**: Você deve compartilhar sua planilha com o e-mail da **Service Account** criada no Google Cloud (com permissão de Editor).

## 🛠️ Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/nodejs-person-assistent.git
cd nodejs-person-assistent
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
   - Preencha as informações necessárias (ID da planilha e credenciais da Service Account).

```bash
cp .env.example .env
```

4. Inicie a aplicação:
```bash
# Modo de desenvolvimento (com hot-reload)
npm run start:dev

# Modo de produção
npm run build
npm run start:prod
```

## 🔐 Segurança

Ao tornar este repositório público, **nunca** envie o seu arquivo `.env` para o GitHub. Ele contém chaves privadas que dão acesso total ao seu Google Drive e planilhas. O arquivo já está incluído no `.gitignore` por padrão.

## 📄 Licença

Este projeto está sob a licença UNLICENSED.
