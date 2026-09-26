# AGENTS.md

Instruções para agentes de IA (ex.: Claude Code) trabalhando neste repositório.

## Visão Geral do Projeto

Frontend do sistema de gestão da mocidade (coristas) da **Assembleia de Deus em Pernambuco (IEADPE)**.
Consome a API [`registro-corista-api`](https://github.com/DavidLimm/registro-corista-api) (Java 21 + Spring Boot 4.1).

Hierarquia do domínio: **Área → Congregação → Pessoa → (Corista)**. O MVP cobre só a **Área 40** (13 congregações), mas a UI já deve nascer multi-área (seletor de área, filtros por `areaId`).

Protótipo de referência (Figma): https://www.figma.com/design/VmpKWvWZTBN8DAdco7jtFT
Telas do MVP: `01 · Login`, `02 · Cadastro de Corista`, `03 · Dashboard Liderança`, `04 · Dashboard Corista`.

> **Regra de ouro:** o backend é a fonte da verdade. Validações e permissões no front existem só para UX. Nunca implementar regra de negócio que contradiga ou substitua a do backend.

## Stack

- **React + JavaScript** (sem TypeScript), criado com **Vite**
- **React Router** para rotas
- **TanStack Query (v5)** para todo estado de servidor (cache, loading, invalidação)
- **React Hook Form + Zod** (`@hookform/resolvers`) para formulários
- **axios** com instância única
- **Tailwind CSS v4** (`@tailwindcss/vite`) com os tokens do design definidos em `@theme`
- **Recharts** para gráficos do dashboard
- **lucide-react** para ícones
- **Vitest + Testing Library + MSW** para testes

NÃO usar Redux, Zustand ou Context para dados vindos da API. Context só para sessão/autenticação e tema.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173 (API esperada em http://localhost:8080)
npm run build
npm run preview
npm run test       # vitest
npm run lint
```

Backend local: no repositório da API, `docker compose up -d` e `./mvnw spring-boot:run`.

## Variáveis de Ambiente

| Variável       | Descrição                                        | Dev                 |
| -------------- | ------------------------------------------------ | ------------------- |
| `VITE_API_URL` | URL base da API. Vazio em dev (usa proxy do Vite) | `''`                |

Nunca commitar `.env`. Manter `.env.example` atualizado.

## Proxy e CORS

A API **ainda não tem CORS configurado**. Em dev, usar o proxy do Vite (as chamadas saem da mesma origem):

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/v1/api': 'http://localhost:8080' } },
});
```

Em produção (Render), o backend precisa liberar a origem do front via `CorsConfigurationSource`. Não tentar contornar CORS no front.

## Arquitetura

Organização **por feature/domínio**, espelhando os pacotes do backend. NÃO organizar por camada técnica global (`components/`, `services/` soltos com tudo misturado).

```
src/
  app/
    main.jsx
    App.jsx
    rotas.jsx                 # definição de rotas + guards
    queryClient.js
  api/
    cliente.js                # instância axios + interceptors
    erros.js                  # normalização de Problem Details
  auth/
    AuthContext.jsx           # sessão (stub até o JWT existir)
    RotaProtegida.jsx
  shared/
    constantes.js             # enums e rótulos
    formatadores.js           # telefone, cep, datas
    idade.js                  # cálculo de idade/faixa (só UX)
    ui/                       # Botao, Campo, Select, Badge, Chip, Card, Tabela, Paginacao, Toast...
    layout/                   # LayoutLideranca (sidebar), LayoutCorista (topbar), LayoutPublico
  features/
    area/          api.js  hooks.js  AreaLista.jsx  AreaForm.jsx
    congregacao/   api.js  hooks.js  CongregacaoLista.jsx  CongregacaoForm.jsx  SelectCongregacao.jsx
    pessoa/        api.js  hooks.js  ...
    corista/       api.js  hooks.js  CoristaLista.jsx  CoristaCadastro.jsx  CoristaDetalhe.jsx  schema.js
    telefone/      api.js  hooks.js  TelefoneLista.jsx  TelefoneForm.jsx
    endereco/      viaCep.js  CamposEndereco.jsx
    role/          api.js  hooks.js  ...
    dashboard/     DashboardLideranca.jsx  DashboardCorista.jsx
    login/         LoginPagina.jsx
  styles/
    index.css                 # @import "tailwindcss" + @theme
```

Regras de camadas:

- `features/x/api.js`: **só** chamadas HTTP (funções puras que recebem params e retornam `data`).
- `features/x/hooks.js`: `useQuery`/`useMutation` com as query keys daquela feature. Componentes usam **apenas** os hooks.
- Componentes **nunca** importam axios nem `cliente.js` diretamente.
- Componentes de `shared/ui` não conhecem o domínio (nada de "corista" dentro deles).

## Padrões de Código

- Nomes de domínio em **Português** (componentes, variáveis, funções, arquivos): `CoristaForm`, `listarCoristas`, `congregacaoId`. Prefixos técnicos do React ficam como são (`useCoristas`, `onSubmit`).
- Nomes de campos enviados/recebidos **idênticos** aos DTOs da API (não renomear `dataNascimento` para `birthDate` etc.).
- Componentes funcionais, um por arquivo, export default.
- Sem lógica de negócio em JSX: extrair para funções/hooks.
- Datas `LocalDate` sempre como string `"YYYY-MM-DD"`; **nunca** passar por `new Date('YYYY-MM-DD')` (desloca um dia pelo fuso).
- `Instant` (ex.: `criadoEm`, `aprovadoEm`) formatado com `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife' })`.

## Design System (tokens do Figma)

Tom institucional: azul-marinho + dourado. Títulos em serifa, interface em sans.

```css
/* src/styles/index.css */
@import "tailwindcss";

@theme {
  --color-marinho: #0B2A5B;
  --color-marinho-escuro: #071C3D;
  --color-marinho-medio: #2F5597;
  --color-dourado: #C9A227;
  --color-dourado-escuro: #7A5E0E;
  --color-dourado-claro: #F6EDD0;
  --color-fundo: #F4F6FA;
  --color-superficie: #FFFFFF;
  --color-suave: #F8F9FC;
  --color-texto: #1A2233;
  --color-texto-suave: #5B6478;
  --color-placeholder: #9AA3B5;
  --color-borda: #DCE1EA;
  --color-sucesso: #2E7D4F;
  --color-sucesso-claro: #E3F2E9;
  --color-alerta: #9A6412;
  --color-alerta-claro: #FCF1DC;
  --color-info-claro: #E7EDF7;
  --color-erro: #B42318;

  --font-titulo: "Playfair Display", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;

  --radius-campo: 8px;
  --radius-card: 12px;
}
```

Fontes via Google Fonts (Playfair Display 600/700/itálico, Inter 400/500/600/700) no `index.html`.

Convenções visuais:

| Elemento            | Especificação                                                                 |
| ------------------- | ----------------------------------------------------------------------------- |
| Título de página    | `font-titulo`, 30–36px, bold, cor `marinho`                                   |
| Título de card      | `font-titulo`, 18–20px, bold, cor `marinho`                                   |
| Card                | fundo branco, borda `borda` 1px, raio 12px, padding 24–32px                   |
| Campo (input)       | altura 46px, raio 8px, borda `borda`; label 13px medium acima                 |
| Botão primário      | fundo `marinho`, texto branco semibold 14px, raio 8px                         |
| Botão secundário    | borda `dourado`, fundo `dourado-claro` (35%), texto `dourado-escuro`          |
| Chip selecionado    | fundo `marinho`, texto branco; não selecionado: branco com borda              |
| Badge Jovem         | fundo `info-claro`, texto `marinho`                                           |
| Badge Adolescente   | fundo `alerta-claro`, texto `alerta`                                          |
| Badge Aprovado      | fundo `sucesso-claro`, texto `sucesso`                                        |
| Sidebar liderança   | fundo `marinho-escuro`, 260px, item ativo com barra `dourado` à esquerda      |

Logo: placeholder até recebermos o arquivo oficial da IEADPE. Não desenhar/recriar o logo institucional.

Acessibilidade: todo campo com `<label>` associado, foco visível (anel `dourado`), contraste AA, mensagens de erro ligadas por `aria-describedby`.

## Contrato da API

Prefixo: `/v1/api`. IDs são `UUID` (string). Remoção é **sempre soft delete**.

| Recurso     | Endpoints                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Área        | `POST /areas` · `GET /areas?ativa=` · `GET /areas/{id}` · `PUT /areas/{id}` · `DELETE /areas/{id}` · `PATCH /areas/{id}/reativar` |
| Congregação | `POST /congregacoes` · `GET /congregacoes?areaId=&ativa=` · `GET/PUT/DELETE /congregacoes/{id}` · `PATCH /congregacoes/{id}/reativar` |
| Pessoa      | `POST /pessoas` · `GET /pessoas` (paginado) · `GET/PUT/DELETE /pessoas/{id}`                                 |
| Corista     | `POST /coristas` · `GET /coristas` (paginado) · `GET/PUT/DELETE /coristas/{id}`                              |
| Telefone    | `POST/GET /pessoas/{pessoaId}/telefones` · `GET/PUT/DELETE /pessoas/{pessoaId}/telefones/{id}`               |
| Endereço    | `POST /enderecos` · `GET/PUT /enderecos/{id}`                                                               |
| Role        | `POST/GET /roles` · `GET/PUT/DELETE /roles/{id}` · `PATCH /roles/{id}/reativar`                             |

Swagger (só em dev): `http://localhost:8080/swagger-ui.html`. Em caso de dúvida sobre um DTO, **consultar o Swagger ou o código da API**, nunca inventar campos.

### Listas não paginadas vs paginadas

- `GET /areas` e `GET /congregacoes` retornam **array simples**.
- `GET /pessoas` e `GET /coristas` retornam o `PagedModel` do Spring Data:

```json
{
  "content": [ /* itens */ ],
  "page": { "size": 20, "number": 0, "totalElements": 57, "totalPages": 3 }
}
```

`page` começa em **0**; `size` padrão 20, máximo 100. Ordenação é por nome (feita no backend).

Filtros (query params, todos opcionais):

- Pessoas: `nome` (trecho), `areaId`, `congregacaoId`, `faixaEtaria` (`ADOLESCENTE|JOVEM`), `status`
- Coristas: `nome` (trecho), `areaId`, `congregacaoId`, `listaClassificacao` (`ADOLESCENTE|JOVEM`), `status`

Filtros e página **devem viver na URL** (`useSearchParams`) e compor a query key:

```js
useQuery({
  queryKey: ['coristas', filtros, page],
  queryFn: () => listarCoristas({ ...filtros, page, size }),
  placeholderData: keepPreviousData,
});
```

### Enums (`shared/constantes.js`)

```js
export const TIPO_VOZ = { SOPRANO: 'Soprano', CONTRALTO: 'Contralto', TENOR: 'Tenor', BAIXO: 'Baixo' };
export const TAMANHO_CAMISA = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
export const STATUS_PESSOA = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', INATIVO: 'Inativo' };
export const LISTA_CLASSIFICACAO = { ADOLESCENTE: 'Adolescente', JOVEM: 'Jovem' };
export const FAIXA_ETARIA = { ADOLESCENTE: 'Adolescente', JOVEM: 'Jovem' };
```

Sempre enviar a **chave** (`SOPRANO`) e exibir o **rótulo** (`Soprano`).

### Payload de cadastro/edição de corista

```json
{
  "pessoa": {
    "nome": "Ana Beatriz Souza",
    "dataNascimento": "2010-05-14",
    "congregacaoId": "uuid",
    "endereco": {
      "logradouro": "Rua Frei Caneca", "numero": "245", "complemento": "Casa B",
      "bairro": "Centro", "cidade": "Paulista", "uf": "PE", "cep": "53401-000"
    },
    "responsavelLegalNome": "Márcia Souza",
    "responsavelLegalTelefone": "(81) 99876-5432",
    "consentimentoLgpd": true
  },
  "tipoVoz": "SOPRANO",
  "tamanhoCamisa": "M",
  "ocupacao": "Estudante"
}
```

- `status` e `listaClassificacao` **nunca** são enviados (o backend define).
- `endereco` é opcional. **Na edição, omitir `endereco` mantém o atual**: só enviar se o usuário alterou.
- Telefones **não** fazem parte deste payload (ver fluxo abaixo).

Validações que o backend aplica (espelhar no schema Zod só para UX):

| Campo                        | Regra                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| `nome`                       | obrigatório, até 150                                                |
| `dataNascimento`             | obrigatória, no passado                                             |
| `congregacaoId`              | obrigatório                                                         |
| `endereco.logradouro/bairro/cidade` | obrigatórios se houver endereço (150/100/100)                |
| `endereco.uf`                | 2 letras                                                            |
| `endereco.cep`               | opcional; `00000-000` ou `00000000`                                 |
| `endereco.numero`            | até 10; `complemento` até 100                                       |
| telefones                    | com DDD, ex.: `(81) 99999-0000`, `81999990000`, `8133334444`        |
| `tipoVoz`, `tamanhoCamisa`   | obrigatórios                                                        |
| `ocupacao`                   | opcional, até 100                                                   |
| menor de 18                  | `responsavelLegalNome` + `responsavelLegalTelefone` + `consentimentoLgpd = true` |

## Tratamento de Erros

A API responde erros no formato **Problem Details (RFC 7807)**: `{ type, title, status, detail, instance }`.

```js
// api/cliente.js
import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '' });

api.interceptors.request.use((config) => {
  const token = obterToken(); // null enquanto não houver JWT
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (erro) => {
    const pd = erro.response?.data ?? {};
    return Promise.reject({
      status: erro.response?.status ?? 0,
      titulo: pd.title,
      detalhe: pd.detail ?? 'Não foi possível completar a operação.',
      campos: pd.errors ?? [], // ainda não enviado pela API (ver Pendências)
    });
  },
);
```

Como reagir por status:

| Status | Significado                                             | UI                                                         |
| ------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| 0      | Sem conexão / API fora                                  | Toast "Sem conexão com o servidor"                         |
| 400    | Validação ou regra (LGPD, responsável incompleto)       | `setError` nos campos se houver `campos`; senão toast com `detalhe` |
| 401/403| (futuro) sessão/permissão                               | Redirecionar para login / tela "Sem permissão"             |
| 404    | Recurso não existe                                      | Tela "Não encontrado"                                      |
| 409    | Conflito (duplicado, área inativa, transição inválida)  | Toast com `detalhe` (a mensagem já é de negócio)           |
| 5xx    | Erro inesperado                                         | Toast genérico + log no console em dev                     |

## Regras de Negócio que Afetam a UI

- **Workflow de cadastro:** todo cadastro entra `PENDENTE` → liderança aprova → `APROVADO`. Remoção = `INATIVO`.
- **Soft delete:** o botão se chama **"Inativar"**, nunca "Excluir", e sempre pede confirmação. `DELETE` retorna 204.
- **Reativar:** existe só para Área, Congregação e Role. Não oferecer para Pessoa/Corista.
- **Faixa etária x lista:**
  - `faixaEtaria` (na `PessoaResponse`) é a **real**, calculada pela data de nascimento. Adolescente até 17a 11m 30d; jovem a partir de 18a.
  - `listaClassificacao` (no Corista) é **gravada**. Por padrão segue a idade.
  - Se `listaClassificacao = JOVEM` e `faixaEtaria = ADOLESCENTE`, houve **promoção antecipada**: exibir badge "Promovido" usando `promovidoEm`.
  - Menor promovido **continua menor**: as regras de LGPD seguem valendo.
- **Edição de corista:** sempre via `PUT /coristas/{id}` (é ele que reclassifica a lista quando a data de nascimento muda). Não editar corista via `/pessoas/{id}`.
- **Congregações:** selects só listam `ativa=true`. Encadear Área → Congregação (`GET /congregacoes?areaId=`), limpando a congregação ao trocar a área. Se houver uma única área ativa, pré-selecionar.

## Fluxos Principais

### Cadastro de corista (tela `02`)

Formulário único em 5 blocos: Dados pessoais, Responsável legal, Endereço, Telefones, Dados do coral.

1. Ao digitar `dataNascimento`, calcular idade em `shared/idade.js` e mostrar `"16 anos · Adolescente"` abaixo do campo.
2. Se idade < 18: exibir o bloco **Responsável legal** com alerta LGPD; nome, telefone e checkbox de consentimento tornam-se obrigatórios (`superRefine` no Zod). Se ≥ 18: esconder o bloco e **não enviar** esses campos.
3. **CEP (ViaCEP):** no blur ou botão "Buscar CEP", chamar `https://viacep.com.br/ws/{cep}/json/` e preencher logradouro, bairro, cidade, UF. Campos continuam editáveis (ViaCEP pode errar; zona rural pode não ter CEP). Número e complemento são digitados. Tratar `{ "erro": true }` como CEP não encontrado.
4. Naipe e camisa por chips (seleção única). Mostrar nota: "A lista é definida automaticamente pela idade".
5. Envio em **duas etapas**:
   ```
   POST /coristas            → resposta.pessoa.id
   POST /pessoas/{id}/telefones   (um por telefone, em sequência)
   ```
   Se um telefone falhar, o corista **já existe**: redirecionar para a edição com aviso para concluir os telefones. Nunca tentar "desfazer" o corista.
6. Sucesso: tela de confirmação informando que o cadastro está **Pendente** de aprovação.

Telefones: o primeiro cadastrado vira principal automaticamente; `principal: true` em outro troca o principal. Enviar com ou sem máscara (a API grava só dígitos); formatar os dígitos na exibição.

### Dashboard da liderança (tela `03`)

Layout com sidebar. Blocos:

- KPIs: coristas aprovados, aguardando aprovação, jovens · adolescentes, congregações ativas.
- Gráfico de barras por naipe e barras horizontais por congregação (Recharts).
- Tabela "Cadastros pendentes" (`GET /coristas?status=PENDENTE`), sinalizando menores.
- Aniversariantes do mês e contagem de camisas por tamanho.

Não existem endpoints de agregação ainda. No MVP, derivar números das listagens (`totalElements` com filtros). Se ficar pesado, **propor endpoint `/dashboard` no backend** em vez de baixar tudo no front.

### Dashboard do corista (tela `04`)

Topbar simples. Boas-vindas com status do cadastro, perfil no coral (naipe, lista, camisa, desde), linha do tempo do cadastro, contatos com "Atualizar meus dados", avisos da liderança e agenda com badge **"Em breve"** (módulo de eventos adiado no backend).

Avisos ainda não têm endpoint: usar dados mockados isolados em `features/dashboard/mocks.js`, fáceis de remover.

## Rotas

```
/login                      público
/cadastro                   público (self-service de corista)
/cadastro/concluido         público
/lideranca                  LayoutLideranca → DashboardLideranca
/lideranca/coristas         lista paginada + filtros
/lideranca/coristas/novo
/lideranca/coristas/:id     detalhe/edição + telefones
/lideranca/aprovacoes       lista de PENDENTES
/lideranca/pessoas
/lideranca/congregacoes
/lideranca/areas
/lideranca/papeis
/corista                    LayoutCorista → DashboardCorista
/corista/meu-cadastro
*                           NaoEncontrado
```

## Autenticação e RBAC (futuro)

A API **ainda não tem Spring Security/JWT**. Até lá:

- `AuthContext` expõe `{ usuario, papel, areas, entrar, sair }` com um usuário fake configurável em dev (para alternar entre visão de liderança e de corista).
- `RotaProtegida` já recebe `papeisPermitidos`, mas no MVP só redireciona para `/login` sem sessão.
- Papéis previstos: `ADMIN` (global), `PASTOR` (até 2 áreas), demais papéis (exatamente 1 área). Nomes exatos do líder da mocidade ainda serão definidos no backend: **não fixar strings de papel espalhadas**; centralizar em `auth/papeis.js`.
- Esconder botões por papel é **só UX**. A autorização real (papel + vínculo de área/congregação) é sempre do backend.

## Pendências do Backend que Bloqueiam o Front

Não implementar gambiarras para contornar; sinalizar e aguardar:

1. **CORS** para o domínio do front em produção.
2. **`@ControllerAdvice`** retornando os erros de Bean Validation com lista de campos (`errors: [{ campo, mensagem }]`) no Problem Details.
3. **Endpoints de aprovação e promoção** (`aprovar`/`promover` existem só no Service). Até lá, o botão "Revisar" abre o detalhe em modo leitura; ações de aprovar/promover ficam atrás de feature flag `VITE_FF_APROVACAO`.
4. **Autenticação JWT** e endpoint de "usuário atual".
5. Endpoints de **dashboard/agregações** e de **avisos**.

## Estratégia de Testes

- **Vitest + Testing Library** para componentes e hooks; **MSW** para mockar a API (handlers em `src/test/handlers.js` com os formatos reais dos DTOs).
- Obrigatório testar: schema de corista (menor x maior de idade), fluxo de cadastro em duas etapas (incluindo falha no telefone), paginação/filtros na URL, mapeamento de erros 400/409.
- `shared/idade.js` e `shared/formatadores.js` com testes unitários de borda (aniversário no dia, 17a 11m 30d, telefone fixo x celular).
- Nenhuma funcionalidade nova entra sem teste mínimo do fluxo principal.

## Convenções de Contribuição

- **GitHub Flow**: `main` sempre estável; tudo via Pull Request.
- **Branches**: `feat/<area>-<atividade>`, `fix/<...>`, `chore/<...>`. Uma atividade por branch.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`, `style:`).
- **Definition of Done**: build ok + lint ok + testes verdes + tela conferida contra o Figma (desktop e 390px de largura) + PR revisado.

## Ordem de Construção Sugerida

1. Setup: Vite, Tailwind com tokens, fontes, proxy, `cliente.js`, `QueryClient`, rotas e layouts (público, liderança, corista).
2. `shared/ui`: Botao, Campo, Select, Chip, Badge, Card, Tabela, Paginacao, Toast, ConfirmDialog.
3. Área e Congregação (CRUD simples) para validar o padrão api → hooks → componentes → erros.
4. Lista paginada de coristas com filtros na URL.
5. Cadastro de corista (LGPD, ViaCEP, telefones em duas etapas).
6. Detalhe/edição de corista e gestão de telefones.
7. Dashboard da liderança e dashboard do corista.
8. Login + AuthContext real quando o JWT existir no backend.

## O Que NÃO Fazer

- Não expor nem depender de campos que não estão nos DTOs.
- Não calcular `listaClassificacao` nem `status` no front para enviar à API.
- Não usar `new Date()` com `LocalDate`.
- Não fazer `fetch` direto em componentes.
- Não guardar dados da API em estado global manual.
- Não chamar "Inativar" de "Excluir".
- Não reproduzir o logo institucional; usar o arquivo oficial quando fornecido.
- Não confiar no front para permissões.