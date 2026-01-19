# 18MC Admin

## Descrição

O 18MC Admin é um painel de administração desenvolvido em Angular para gerenciar integrantes, regionais, divisões, ações sociais, relatórios e outras funcionalidades relacionadas ao sistema 18MC. Esta aplicação utiliza Angular Material para uma interface moderna e responsiva, com autenticação JWT, interceptores HTTP e um backend simples em Express.js para servir a aplicação em produção.

## Funcionalidades

- **Autenticação**: Login, logout, redefinição de senha e guards de autenticação.
- **Dashboard**: Painel responsivo com sidebar para navegação.
- **Gerenciamento de Usuários**: Listagem, criação e edição de usuários.
- **Gerenciamento de Integrantes**: Listagem, criação e edição de integrantes.
- **Regionais**: Gerenciamento de regionais.
- **Divisões**: Gerenciamento de divisões.
- **Ações Sociais**: Funcionalidades relacionadas a ações sociais.
- **Relatórios**: Geração e visualização de relatórios.
- **Pessoas e Regionais**: Gerenciamento de pessoas e regionais.
- **Gráficos**: Integração com ngx-charts para visualizações.
- **Interceptors**: Spinner para requisições HTTP, tratamento de erros globais e logging.
- **Responsivo**: Design totalmente responsivo com Angular Flex Layout.

## Pré-requisitos

- Node.js versão 20.17.0
- npm versão 10.8.2
- Angular CLI (instalado globalmente: `npm install -g @angular/cli`)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/kevinjh07/18mc-admin.git
   cd 18mc-admin
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## Executando a Aplicação

### Desenvolvimento
Para executar em modo de desenvolvimento:
```bash
npm run dev
```
Navegue para `http://localhost:4200/`. A aplicação recarregará automaticamente se você alterar qualquer arquivo fonte.

### Produção
Para executar a aplicação em produção (serve os arquivos buildados):
```bash
npm start
```
A aplicação estará disponível em `http://localhost:8080` (ou na porta definida pela variável `PORT`).

## Build

Para construir a aplicação para produção:
```bash
npm run build
```
Os artefatos de build serão armazenados no diretório `dist/18mc-admin/`.

Para build de produção com base-href específico:
```bash
npm run build-production
```

## Testes

### Testes Unitários
Execute os testes unitários via Karma:
```bash
npm test
```

### Testes End-to-End
Para executar testes e2e, primeiro adicione um pacote que implemente capacidades de teste e2e, então execute:
```bash
ng e2e
```

## Lint

Para verificar o código com ESLint:
```bash
npm run lint
```

## Implantação

Esta aplicação está configurada para implantação no Heroku. O script `heroku-postbuild` constrói a aplicação automaticamente após o push.

Para outras plataformas, construa a aplicação e sirva os arquivos em `dist/18mc-admin/` com um servidor web.

## Estrutura do Projeto

- `src/app/core/`: Módulos core, guards, interceptors, models e services.
- `src/app/features/`: Módulos de funcionalidades (auth, dashboard, users, etc.).
- `src/app/shared/`: Módulos compartilhados, diretivas, pipes, etc.
- `server.js`: Servidor Express simples para produção.

## Contribuição

1. Fork o projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## Ajuda Adicional

Para mais ajuda com o Angular CLI, use `ng help` ou consulte a [documentação do Angular CLI](https://angular.io/cli).
