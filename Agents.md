# AGENTS.md

Instruções para agentes de IA (ex.: Claude Code) trabalhando neste repositório.

> Este documento incorpora o `ORIENTACAO_FRONT.md` enviado pelo backend (estado da API na branch `feat/hierarquia-agrupamento`,
> migrations até a V32, Auth0 ainda planejado). Em caso de dúvida sobre um DTO ou rota, **consultar o Swagger**
> (`http://localhost:8080/swagger-ui.html`, só em dev) ou o código da API — nunca inventar campos.

## Visão Geral do Projeto

Frontend do sistema de gestão da mocidade (coristas) da **Assembleia de Deus em Pernambuco (IEAD-PE)**.
Consome a API [`registro-corista-api`](https://github.com/DavidLimm/registro-corista-api) (Java 21 + Spring Boot 4.1).

Hierarquia do domínio:

```
Agrupamento (tipo)  →  Subdivisão  →  Congregação  →  Pessoa  →  (Corista)
```

| Conceito | O que é |
| -------- | ------- |
| **Agrupamento** | Nível mais alto. Tem um **tipo**: `CAMPO_MISSIONARIO` (exterior), `FILIAL`, `SETOR` ou `AREA`. As 74 áreas já existem no banco. |
| **Subdivisão** | Nível do meio. Em campo missionário é um **Local** (tem nome); em filial/setor é uma **Área** (tem número); no tipo `AREA` é **implícita** (sem número nem nome, não se cria à mão). |
| **Congregação** | A igreja local. Pertence a uma subdivisão. |
| **Pessoa** | Dados comuns (nome, nascimento, congregação, endereço, status). Existe **uma vez só**. |
| **Corista** | Especialização 1:1 de Pessoa (voz, camisa, ocupação, lista adolescente/jovem). |
| **Usuário (login)** | Credenciais de uma pessoa (e-mail + senha). Nem toda pessoa tem login. |

Exemplos reais de caminho: `Argentina (campo) → Local Alejandro Korn → congregação`; `Petrolina (filial) → Área 1 → congregação`;
`Setor 1 – Cabo de Santo Agostinho → Área 10 → congregação`; `Área 40 → congregação` (subdivisão implícita).

Protótipo de referência (Figma): https://www.figma.com/design/VmpKWvWZTBN8DAdco7jtFT
Telas do MVP: `01 · Login`, `02 · Cadastro de Corista`, `03 · Dashboard Liderança`, `04 · Dashboard Corista`. O protótipo ainda mostra
só "Área 40"; a UI real nasce multi-agrupamento, com a cascata tipo → agrupamento → subdivisão → congregação.

**Duas classificações que não se confundem**
- **Faixa etária** (`faixaEtaria`): derivada da data de nascimento, nunca gravada. Adolescente até 17a 11m 30d; jovem a partir de 18.
- **Lista de classificação** (`listaClassificacao`, só no corista): é gravada. Nasce igual à idade; só `LIDER_MOCIDADE` promove
  adolescente → jovem antes dos 18 (permanente, só nesse sentido). Aprovar/reprovar cadastro **nunca** muda a lista.

**Status da pessoa** (`status`): `PENDENTE` → `APROVADO` ou `REPROVADO`; `APROVADO` ⇄ `AFASTADO`; remoção é `INATIVO` (soft delete,
nunca apaga). **Só quem está `APROVADO` consegue entrar no sistema.**

> **Regra de ouro:** o backend é a fonte da verdade. Validações e permissões no front existem só para UX. Nunca implementar regra de
> negócio que contradiga ou substitua a do backend. **Nunca confiar no front para segurança**: esconder um botão é conforto, não proteção.

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
| `VITE_API_URL` | URL base da API (host, sem o prefixo `/v1/api`). Vazio em dev (usa proxy do Vite) | `''` |

Nunca commitar `.env`. Manter `.env.example` atualizado.

## Proxy e CORS

A API **ainda não tem CORS configurado** (será resolvido junto do Auth0 — seção "Auth0"). Em dev, usar o proxy do Vite:

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
    rotas.jsx                 # definição de rotas + guards por permissão
    queryClient.js
  api/
    cliente.js                # instância axios (baseURL já com /v1/api) + interceptors
    erros.js                  # normalização de Problem Details
  auth/
    AuthContext.jsx           # sessão real: login, logout, usuário, permissões
    RotaProtegida.jsx         # guarda por permissão (não por nome de papel)
    token.js                  # token em módulo isolado (lido pelo interceptor do axios)
    permissoes.js             # constantes de permissão + temPermissao()/temAlgumaPermissao()
    papeis.js                 # rótulos em português dos papéis (só exibição)
  shared/
    constantes.js             # enums e rótulos
    formatadores.js           # telefone, cep, datas
    idade.js                  # cálculo de idade/faixa (só UX)
    ui/                       # Botao, Campo, Select, Badge, Chip, Card, Tabela, Paginacao, Toast...
    layout/                   # LayoutLideranca (sidebar), LayoutCorista (topbar), LayoutPublico
  features/
    agrupamento/   api.js  hooks.js  AgrupamentoLista.jsx  AgrupamentoForm.jsx
    subdivisao/    api.js  hooks.js  SubdivisaoLista.jsx  SubdivisaoForm.jsx  SelectSubdivisao.jsx
    congregacao/   api.js  hooks.js  CongregacaoLista.jsx  CongregacaoForm.jsx  SelectCongregacao.jsx
    pessoa/        api.js  hooks.js  ...
    corista/       api.js  hooks.js  CoristaLista.jsx  CoristaCadastro.jsx  CoristaDetalhe.jsx  schema.js
    telefone/      api.js  hooks.js  TelefoneLista.jsx  TelefoneForm.jsx
    endereco/      viaCep.js  CamposEndereco.jsx
    afastamento/   api.js  hooks.js  SolicitacoesLista.jsx
    usuario/       api.js  hooks.js  UsuarioLista.jsx  UsuarioForm.jsx  EscopoForm.jsx
    role/          api.js  hooks.js  RoleLista.jsx  PermissoesForm.jsx
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
- Menu, botão ou rota: decidir visibilidade sempre por **permissão** (`temPermissao(permissoes, 'CORISTA_APROVAR')`), **nunca** pelo
  nome do papel — as permissões de cada papel podem mudar sem deploy (seção "Papéis e permissões").

## Padrões de Código

- Nomes de domínio em **Português** (componentes, variáveis, funções, arquivos): `CoristaForm`, `listarCoristas`, `congregacaoId`,
  `agrupamentoId`, `subdivisaoId`. Prefixos técnicos do React ficam como são (`useCoristas`, `onSubmit`).
- Nomes de campos enviados/recebidos **idênticos** aos DTOs da API (não renomear `dataNascimento` para `birthDate` etc.).
- Componentes funcionais, um por arquivo, export default.
- Sem lógica de negócio em JSX: extrair para funções/hooks.
- Datas `LocalDate` sempre como string `"YYYY-MM-DD"`; **nunca** passar por `new Date('YYYY-MM-DD')` (desloca um dia pelo fuso).
- Instantes (`criadoEm`, `atualizadoEm`, `aprovadoEm`...) são ISO-8601 UTC (`"2026-10-11T12:00:00Z"`); formatar com
  `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife' })`. Podem vir `null` em respostas de criação imediata — tratar como opcionais.

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

## Autenticação e Segurança

A API **já tem login próprio com JWT** (não é stub). O **Auth0 está planejado como próximo passo do backend** (seção "Auth0" abaixo) —
por isso, desde já: **isolar toda a autenticação do front em um único módulo** (`src/auth/`): login, logout, obter token, anexar
`Authorization`, tratar 401. Nenhum outro arquivo lê token ou chama `/auth/*` diretamente.

- `POST /auth/login` (público) `{ email, senha }` → `200 { token, email, roles }`.
  - `roles` **mistura duas coisas**: papéis (`ROLE_<NOME>`) e permissões (`CORISTA_LER`, `CORISTA_APROVAR`...). Guardar a lista toda
    junto do token — é dela que o front decide o que mostrar.
  - E-mail é normalizado (espaços/maiúsculas não importam).
  - Token vale **60 minutos**, **sem refresh token**: ao 401, limpar sessão e voltar para `/login` (interceptor global do axios).
  - Guardar o token em memória (mais seguro) ou `sessionStorage`; evitar `localStorage`; nunca na URL.
  - **Não decodificar o token** para checar permissão — confiar só nos `roles` devolvidos no login. O backend recarrega o usuário a
    cada requisição: afastar, reprovar, inativar, bloquear ou trocar papel vale na hora (a próxima chamada já devolve 401/403).
- Erros do login: `401` e-mail ou senha errados (mensagem genérica: "E-mail ou senha inválidos", a API não diz qual); `403` senha
  certa mas cadastro não libera acesso (mostrar o `detail`: pendente, reprovado, afastado, inativo, acesso desativado — só aparece
  **depois** de a senha conferir); `423` conta bloqueada por 3 senhas erradas seguidas.
- `PUT /auth/senha` (logado) `{ senhaAtual, novaSenha }` → `204` e **derruba todos os tokens antigos**: depois do `204`, limpar o
  token e levar ao login.
- Esqueci a senha: `POST /auth/redefinicao-senha/solicitar` `{ email }` → sempre `202` → usuário recebe um token por e-mail →
  `POST /auth/redefinicao-senha/confirmar` `{ token, novaSenha }` → `204`. Token vale 30 min, uso único, também libera conta bloqueada.
  Em produção, **o envio real de e-mail ainda não está configurado** (ver "Pendências") — construir a tela mesmo assim; em dev o
  token aparece no log do backend.
- Rotas públicas (sem token): `POST /auth/login`, `POST /auth/redefinicao-senha/solicitar`, `POST /auth/redefinicao-senha/confirmar`,
  `POST /coristas` (auto-cadastro), `GET /congregacoes`, `GET /congregacoes/{id}`, `GET /agrupamentos`, `GET /agrupamentos/{id}`,
  `GET /agrupamentos/{id}/subdivisoes`, `GET /agrupamentos/{id}/subdivisoes/{subId}`. Todo o resto exige token.
- Senha (`senha`/`novaSenha`): mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial; máximo 100.
- Regras que o front deve respeitar: tratar **401 globalmente** (interceptor único, limpar sessão e ir ao login); tratar **403** com
  o `detail`, **sem** forçar logout; quem autoriza ações (`aprovadoPor`, `afastadoPor`, `promovidoPor`...) é sempre o **usuário
  logado** — **o front nunca envia o autor**; o papel de um auto-cadastro é **sempre derivado** (corista adolescente/jovem) — o front
  não escolhe papel no cadastro público; não registrar senha, token ou dados de menores em logs/analytics.
- **LGPD:** menores de 18 anos exigem **responsável legal** (nome + telefone) e **consentimento explícito**. O `nomeExibicao` de um
  menor já vem como `"Pedro Campos (responsável: Maria Oliveira)"` — usar esse campo nas listagens. Mostrar o aviso de consentimento
  no cadastro.

### Papéis (nomes exatos, chegam em `roles` com o prefixo `ROLE_`)

| Papel | Quem é | Alcance |
| ----- | ------ | ------- |
| `ADMIN` | Administração do sistema | **Global**, todas as permissões |
| `PASTOR_ADMIN` | Pastor geral | **Global**, **somente leitura** nos dados; gerencia agrupamentos, subdivisões, escopo e logins de pastores |
| `PASTOR` | Pastor de área/setor/filial/campo | Seus agrupamentos (até 2; campo missionário fica sozinho) |
| `PRESBITERO` | Presbítero | Só a **sua congregação** (dashboards, leitura) |
| `LIDER_MOCIDADE` | Líder da mocidade | Seu agrupamento, as duas listas; promove, afasta, gere pessoas |
| `LIDER_ADOLESCENTES` / `LIDER_JOVENS` | Líderes de cada lista | Seu agrupamento, só a lista deles |
| `DIRIGENTE_UNIAO` | Dirigente da união | Aprova cadastro de **adolescentes** |
| `LIDERANCA_GRUPO_JOVEM` / `DIRIGENTE_CAMPANHA` | Liderança de jovens | Aprovam cadastro de **jovens** |
| `APOIO_ADOLESCENTES` / `APOIO_JOVENS` | Apoio | Operação limitada à lista deles |
| `MAESTRO_ADOLESCENTES` / `MAESTRO_JOVENS` | Maestro | Lê a lista dele e troca **só o tipo de voz** |
| `CORISTA_ADOLESCENTES` / `CORISTA_JOVENS` | Corista | **Só o próprio cadastro** |

Rótulos em português centralizados em `auth/papeis.js` (ADMIN "Administrador", PASTOR_ADMIN "Pastor geral", PASTOR "Pastor",
PRESBITERO "Presbítero", LIDER_MOCIDADE "Líder da mocidade", LIDER_ADOLESCENTES "Líder dos adolescentes", LIDER_JOVENS "Líder dos
jovens", DIRIGENTE_UNIAO "Dirigente da união", LIDERANCA_GRUPO_JOVEM "Liderança do grupo de jovens", DIRIGENTE_CAMPANHA "Dirigente de
campanha", APOIO_* "Apoio", MAESTRO_* "Maestro", CORISTA_* "Corista").

`CORISTA_*` **não convive** com outro papel (quem vira líder deixa de ser corista). Um usuário tem 1+ papéis; as permissões dele são
a união de todos.

### Permissões (o que o front lê em `roles`) — **decidir sempre por permissão, nunca pelo nome do papel**

| Permissão | Libera |
| --------- | ------ |
| `CORISTA_CRIAR` | Cadastrar corista (logado) |
| `CORISTA_LER` | Listar/ver coristas (dentro do recorte e do escopo) |
| `CORISTA_ATUALIZAR` | Editar corista (o próprio, ou os do recorte se também tiver `CORISTA_LER`) |
| `CORISTA_ATUALIZAR_VOZ` | Trocar só o tipo de voz (maestro) |
| `CORISTA_INATIVAR` | Remover (soft) corista |
| `CORISTA_APROVAR` / `CORISTA_REPROVAR` | Aprovar / reprovar cadastro de corista |
| `CORISTA_PROMOVER` | Promover adolescente → jovem |
| `CORISTA_SOLICITAR_AFASTAMENTO` | Pedir o afastamento de um corista |
| `CORISTA_APROVAR_AFASTAMENTO` | Decidir pedidos de afastamento; afastar e retornar |
| `CORISTA_CORRIGIR_NASCIMENTO` | Alterar a data de nascimento de um corista |
| `PESSOA_CRIAR` / `LER` / `ATUALIZAR` / `INATIVAR` | CRUD de pessoa (telefones e endereços dependem de `LER`/`ATUALIZAR`) |
| `PESSOA_APROVAR` / `PESSOA_REPROVAR` | Aprovar / reprovar uma pessoa |
| `CONGREGACAO_GERENCIAR` | Criar, editar, mover, inativar congregações (só nos seus agrupamentos) |
| `AGRUPAMENTO_GERENCIAR` | Criar/editar/inativar agrupamentos e subdivisões (ADMIN e PASTOR_ADMIN) |
| `ESCOPO_GERENCIAR` | Definir os agrupamentos de cada usuário (ADMIN e PASTOR_ADMIN) |
| `USUARIO_GERENCIAR` | CRUD de logins |
| `ROLE_SOLICITAR` | Pedir um papel novo |
| `ROLE_APROVAR` | Aprovar/reprovar pedidos de papel |
| `ROLE_GERENCIAR_PERMISSOES` | Criar/editar papéis e editar as permissões de cada papel |
| `DASHBOARD_LER` | Acessar dashboards |

Constantes das permissões e os helpers `temPermissao()`/`temAlgumaPermissao()` ficam em `auth/permissoes.js`.

### Quais permissões abrem cada item de menu

| Item de menu / tela | Mostrar se tiver |
| -------------------- | ----------------- |
| Meu perfil | qualquer usuário logado (`GET /coristas/meu` dá 404 para quem não é corista) |
| Lista de coristas | `CORISTA_LER` |
| Aprovações pendentes | `CORISTA_APROVAR` ou `CORISTA_REPROVAR` |
| Fila de afastamentos | `CORISTA_APROVAR_AFASTAMENTO` |
| Pessoas | `PESSOA_LER` |
| Congregações (gerenciar) | `CONGREGACAO_GERENCIAR` |
| Agrupamentos e subdivisões | `AGRUPAMENTO_GERENCIAR` |
| Usuários | `USUARIO_GERENCIAR` |
| Escopo dos usuários | `ESCOPO_GERENCIAR` |
| Papéis e permissões | `ROLE_GERENCIAR_PERMISSOES`; pedir papel: `ROLE_SOLICITAR`; decidir pedido: `ROLE_APROVAR` |
| Dashboard | `DASHBOARD_LER` (hoje só dá para montar com contagens por `totalElements`) |

### Hierarquia e escopo (o que cada usuário enxerga)

Além da permissão, **cada usuário só enxerga e altera o que pertence aos agrupamentos a que está vinculado**:

- `ADMIN` e `PASTOR_ADMIN`: veem **tudo** (globais).
- `PASTOR`: até **2** agrupamentos (se um é campo missionário, fica só nele). Sem vínculo, não enxerga nada. O vínculo é definido por
  `ADMIN`/`PASTOR_ADMIN` (`PUT /usuarios/{id}/agrupamentos`).
- Demais papéis: **exatamente 1** agrupamento, herdado da congregação da pessoa quando o login é criado (inclusive no auto-cadastro).
- Fora do escopo: pessoa, corista, telefone, endereço, fila de afastamento e logins respondem **404**; escrever em congregação de
  outro agrupamento responde **403**.
- Os filtros `agrupamentoId`/`subdivisaoId` do cliente **só reduzem** o resultado, nunca ampliam o escopo.
- Líder de adolescentes não vê jovens, e vice-versa; presbítero só a própria congregação; corista, só ele.

Para montar o dashboard do pastor: `GET /usuarios/meu/agrupamentos` devolve os agrupamentos dele (`global: true` para ADMIN/PASTOR_ADMIN).

## Auth0 (próximo passo do backend)

> **Ainda não implementado** — o front de hoje continua usando `POST /auth/login`. Mas o backend já decidiu que o próximo passo é
> integrar o **Auth0**, então construir a autenticação atual já isolada evita retrabalho:

- O login passará a ser pelo Auth0 (Universal Login, Authorization Code + PKCE), com o front usando `@auth0/auth0-react` e enviando
  o access token do Auth0 no `Authorization`. A API vira um resource server (valida o JWT por JWKS).
- Continuam no backend: cadastro, status, papéis, permissões e escopo. O Auth0 diz **quem é** o usuário; o backend continua dizendo
  **o que ele pode**.
- Quando migrar: as telas de login, "esqueci a senha" e "trocar senha" próprias somem (o fluxo vira do Auth0); o SDK cuida do token
  (inclusive renovação, resolvendo a falta de refresh token hoje).
- Preparação (já aplicar agora): único módulo de autenticação (`auth/`, feito); interceptor HTTP único tratando 401 (feito);
  decidir telas por **permissão**, nunca por papel, atrás de `temPermissao(...)` (feito); não espalhar suposições sobre o formato do
  token (não decodificamos o JWT em nenhum lugar — correto, manter assim).

## Contrato da API

Prefixo: `/v1/api` (incluído no `baseURL` de `api/cliente.js` — as chamadas em `features/x/api.js` usam caminhos relativos a ele, ex.:
`api.get('/congregacoes')`). IDs são `UUID` (string). Datas `LocalDate` como `"2000-05-17"`; instantes em ISO-8601 UTC. Remoção é
**sempre soft delete**. Corpo vazio: `DELETE` e várias ações devolvem `204`. Criação: `POST` devolve `201` com o recurso e a URL no
header `Location`.

| Recurso | Endpoints |
| ------- | --------- |
| Autenticação | `POST /auth/login` · `PUT /auth/senha` · `POST /auth/redefinicao-senha/solicitar` · `POST /auth/redefinicao-senha/confirmar` |
| Agrupamento | `POST/GET /agrupamentos?tipo=&ativo=` · `GET/PUT/DELETE /agrupamentos/{id}` · `PATCH /agrupamentos/{id}/reativar` |
| Subdivisão | `GET/POST /agrupamentos/{agrupamentoId}/subdivisoes?ativo=` · `GET/PUT/DELETE /agrupamentos/{agrupamentoId}/subdivisoes/{id}` · `PATCH .../reativar` |
| Congregação | `POST/GET /congregacoes?agrupamentoId=&subdivisaoId=&ativa=` · `GET/PUT/DELETE /congregacoes/{id}` · `PATCH /congregacoes/{id}/reativar` |
| Pessoa | `POST /pessoas` · `GET /pessoas?nome=&agrupamentoId=&subdivisaoId=&congregacaoId=&faixaEtaria=&status=` (paginado) · `GET/PUT/DELETE /pessoas/{id}` · `PATCH /pessoas/{id}/aprovar` · `/reprovar` · `/afastar` · `/retornar-do-afastamento` |
| Corista | `POST /coristas` (público, auto-cadastro) · `GET /coristas?nome=&agrupamentoId=&subdivisaoId=&congregacaoId=&listaClassificacao=&status=` (paginado) · `GET /coristas/meu` · `GET/PUT/DELETE /coristas/{id}` · `PATCH /coristas/{id}/voz` · `/aprovar` · `/reprovar` · `/promover` · `/afastar` · `/retornar-do-afastamento` |
| Afastamento | `POST /coristas/{id}/solicitar-afastamento` · `GET /solicitacoes-afastamento?status=` (paginado) · `PATCH /solicitacoes-afastamento/{id}/aprovar` · `/negar` |
| Telefone | `POST/GET /pessoas/{pessoaId}/telefones` · `GET/PUT/DELETE /pessoas/{pessoaId}/telefones/{id}` |
| Endereço | `POST /enderecos` · `GET/PUT /enderecos/{id}` |
| Usuário (login) | `POST/GET /usuarios?ativo=` (paginado) · `GET/PUT/DELETE /usuarios/{id}` · `PATCH /usuarios/{id}/reativar` |
| Escopo | `GET /usuarios/meu/agrupamentos` · `GET/PUT /usuarios/{id}/agrupamentos` |
| Role/permissões | `GET/POST /roles?ativo=&status=` · `GET/PUT/DELETE /roles/{id}` · `POST /roles/solicitacoes` · `PATCH /roles/{id}/aprovar` · `/reprovar` · `/reativar` · `GET/PUT /roles/{id}/permissoes` |

Swagger (só em dev): `http://localhost:8080/swagger-ui.html`, contrato OpenAPI em `http://localhost:8080/v3/api-docs` (dá para gerar
tipos/cliente a partir dele, ex. `openapi-typescript`). Em produção está desligado.

### Listas não paginadas vs paginadas

- `GET /agrupamentos`, `GET /agrupamentos/{id}/subdivisoes`, `GET /congregacoes` e `GET /roles` retornam **array simples**.
- `GET /pessoas`, `GET /coristas`, `GET /usuarios` e `GET /solicitacoes-afastamento` retornam o `PagedModel` do Spring Data:

```json
{
  "content": [ /* itens */ ],
  "page": { "size": 20, "number": 0, "totalElements": 57, "totalPages": 3 }
}
```

`page` começa em **0**; `size` padrão 20, máximo 100. A **ordenação é fixa** (por nome/e-mail) — o cliente não escolhe.

**Dica para dashboards (a API ainda não tem rotas de contagem):** peça `size=1` com os filtros desejados e leia
`page.totalElements`. Ex.: `GET /coristas?status=PENDENTE&size=1` → quantos cadastros pendentes.

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
export const TIPO_AGRUPAMENTO = { CAMPO_MISSIONARIO: 'Campo Missionário', FILIAL: 'Filial', SETOR: 'Setor', AREA: 'Área' };
export const STATUS_PESSOA = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', REPROVADO: 'Reprovado', AFASTADO: 'Afastado', INATIVO: 'Inativo' };
export const FAIXA_ETARIA = { ADOLESCENTE: 'Adolescente', JOVEM: 'Jovem' };
export const LISTA_CLASSIFICACAO = { ADOLESCENTE: 'Adolescente', JOVEM: 'Jovem' };
export const TIPO_VOZ = { BAIXO: 'Baixo', CONTRALTO: 'Contralto', SOPRANO: 'Soprano', TENOR: 'Tenor' };
export const TAMANHO_CAMISA = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
export const STATUS_SOLICITACAO = { PENDENTE: 'Pendente', APROVADA: 'Aprovada', NEGADA: 'Negada' };
export const STATUS_ROLE = { PENDENTE: 'Pendente', APROVADA: 'Aprovada', REPROVADA: 'Reprovada' };
```

Sempre enviar a **chave** (`SOPRANO`) e exibir o **rótulo** (`Soprano`). Um valor de enum inexistente no corpo devolve `400`.

Rótulo de agrupamento na tela: `AREA` → `Área {numero}` · `SETOR` → `Setor {numero} – {nome}` · `FILIAL` → `Filial {nome}` ·
`CAMPO_MISSIONARIO` → `{nome} ({pais})`.

### Payload de cadastro/edição de corista

```jsonc
// POST /coristas (público, auto-cadastro)
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
  "ocupacao": "Estudante",
  "usuario": { "email": "ana@exemplo.com", "senha": "SenhaForte@123" }
}
```

- `usuario` (e-mail + senha) só existe no **auto-cadastro** (`POST`); no `PUT` é **ignorado**.
- `status` e `listaClassificacao` **nunca** são enviados (o backend define).
- `endereco` é opcional. **Na edição, omitir `endereco` mantém o atual**: só enviar se o usuário alterou.
- Telefones **não** fazem parte deste payload. **Lacuna conhecida do backend:** o cadastro público não cria telefone do corista (o
  endpoint de telefone exige login) — o telefone do próprio corista é cadastrado **depois do primeiro login**. Só o telefone do
  **responsável** vai no cadastro, dentro de `pessoa.responsavelLegalTelefone`.

Validações que o backend aplica (espelhar no schema Zod só para UX; a resposta de erro de campo é genérica hoje — seção
"Tratamento de Erros"):

| Campo                        | Regra                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| `email`                      | obrigatório, formato de e-mail, até 150                              |
| `senha` / `novaSenha`        | 8–100, com maiúscula, minúscula, número e caractere especial         |
| `pessoa.nome`                | obrigatório, até 150                                                 |
| `pessoa.dataNascimento`      | obrigatória, no passado                                               |
| `pessoa.congregacaoId`       | obrigatório                                                          |
| menor de 18                  | `responsavelLegalNome` **e** `responsavelLegalTelefone` obrigatórios; `consentimentoLgpd = true` |
| `responsavelLegalNome`       | até 150; nome e telefone vêm **juntos** (um sem o outro é 400)       |
| telefones                    | `^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$` — aceita `81999990000`, `(81) 99999-0000`, `8133334444`; a API grava só os dígitos |
| `endereco.logradouro`        | obrigatório, até 150                                                 |
| `endereco.numero`            | opcional, até 10                                                     |
| `endereco.complemento`       | opcional, até 100                                                    |
| `endereco.bairro` / `cidade` | obrigatórios, até 100                                                 |
| `endereco.uf`                | obrigatória, 2 letras (a API grava em maiúsculas)                    |
| `endereco.cep`               | opcional (zona rural pode não ter); `00000-000` ou `00000000`; a API grava só dígitos |
| `tipoVoz`, `tamanhoCamisa`   | obrigatórios (enums)                                                  |
| `ocupacao`                   | opcional, até 100                                                     |
| `motivo` (afastamento)       | obrigatório, até 500                                                  |
| `agrupamento`                | campos variam por `tipo` (ver tabela abaixo); `numero` > 0; `nome` até 150; `pais` até 100 |
| `subdivisao`                 | `numero` > 0; `nome` até 150 (regra por tipo do agrupamento pai)      |
| `congregacao.nome`           | obrigatório, até 150                                                  |
| `role.nome`                  | até 50; `descricao` até 255                                           |

Idade: calcular pela `dataNascimento` — menor de 18 vale até 17 anos, 11 meses e 30 dias (`shared/idade.js`, só UX).

Campos de `Agrupamento` por `tipo` (a API recusa campo que não pertence ao tipo, 400):

| `tipo`              | Obrigatórios     | Não pode ter      |
| ------------------- | ---------------- | ------------------ |
| `CAMPO_MISSIONARIO` | `nome`, `pais`   | `numero`           |
| `FILIAL`            | `nome`           | `numero`, `pais`   |
| `SETOR`             | `numero`, `nome` | `pais`              |
| `AREA`              | `numero`         | `nome`, `pais`      |

## Tratamento de Erros

A API responde erros no formato **Problem Details (RFC 7807/9457)**: `{ type, title, status, detail, instance }`, com
`Content-Type: application/problem+json`. Mostrar ao usuário o campo **`detail`** (já em português).

```js
// api/cliente.js
import axios from 'axios';
import { obterToken, notificarSessaoExpirada } from '../auth/token';

export const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL ?? ''}/v1/api` });

api.interceptors.request.use((config) => {
  const token = obterToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (erro) => {
    if (erro.response?.status === 401) notificarSessaoExpirada();
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

| Status | Significado                                                        | UI                                                                   |
| ------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 0      | Sem conexão / API fora                                             | Toast "Sem conexão com o servidor"                                    |
| 400    | Corpo inválido, UUID mal formado, regra simples (ex.: menor sem responsável) | Mostrar o `detail`; para erro de campo, hoje o `detail` é genérico — repetir as validações da seção acima no front |
| 401    | Sem token, token inválido/expirado, ou e-mail/senha errados no login | Interceptor global: limpar sessão e ir para `/login`                 |
| 403    | Falta permissão; login não liberado (com o motivo); ação fora dos seus agrupamentos | Mostrar o `detail`. **Não** deslogar.                                 |
| 404    | Não existe **ou está fora do escopo** (a API não revela que existe) | Tratar como "não encontrado"                                          |
| 409    | Conflito: duplicado, transição de status inválida, inativar com dependentes, escopo incompatível | Mostrar o `detail`                                                     |
| 423    | Conta bloqueada por 3 senhas erradas                                | Mostrar o aviso e levar à redefinição de senha                        |
| 429    | Pessoa editou telefone/endereço há menos de 10 dias                 | Mostrar o `detail` (traz a data liberada)                             |
| 5xx    | Erro inesperado                                                     | Toast genérico + log no console em dev                                |

**Erros de validação de campo:** o padrão de mercado (Problem Details + `errors: [{ campo, mensagem }]`) ainda **não está
implementado** no backend — hoje só vem `{"detail":"Invalid request content."}`, sem `errors`. Por isso: (1) validar no front com
as regras da seção "Contrato da API" (necessário para resposta imediata); (2) escrever o tratador **já preparado** para o formato-alvo,
para quando o backend implementar nada mudar no front:

```js
function aplicarErros(problema, marcarCampo, mostrarAviso) {
  if (problema.campos?.length) problema.campos.forEach((e) => marcarCampo(e.campo, e.mensagem));
  else mostrarAviso(problema.detalhe);
}
```

## Regras de Negócio que Afetam a UI

- **Workflow de cadastro:** todo cadastro entra `PENDENTE` → liderança aprova (`APROVADO`) ou reprova (`REPROVADO`). `APROVADO` pode
  ser afastado (`AFASTADO`) e depois retornar a `APROVADO`. Remoção = `INATIVO`. **Só `APROVADO` consegue logar** — os demais recebem
  403 no login com o motivo.
- **Soft delete:** o botão se chama **"Inativar"**, nunca "Excluir", e sempre pede confirmação. `DELETE` retorna 204.
- **Reativar:** existe para Agrupamento, Subdivisão, Congregação, Usuário e Role. Não oferecer para Pessoa/Corista (eles usam o
  workflow de status, não reativação).
- **Faixa etária x lista:**
  - `faixaEtaria` (na `Pessoa`) é a **real**, calculada pela data de nascimento. Adolescente até 17a 11m 30d; jovem a partir de 18a.
  - `listaClassificacao` (no Corista) é **gravada**. Por padrão segue a idade.
  - Promoção (`PATCH /coristas/{id}/promover`, só `CORISTA_PROMOVER`/`LIDER_MOCIDADE`) é adolescente → jovem antes dos 18,
    **irreversível**: pedir confirmação na tela. 409 se já é jovem ou já tem 18+. Exibir badge "Promovido" usando `promovidoEm`.
  - Menor promovido **continua menor**: as regras de LGPD seguem valendo.
- **Edição de corista:** sempre via `PUT /coristas/{id}` com o corpo completo. O corista **não altera a própria data de nascimento**
  (reenviar a mesma; mudar dá 403, a menos que quem edita tenha `CORISTA_CORRIGIR_NASCIMENTO`). Pode mudar de congregação **só dentro
  do mesmo agrupamento**.
- **Limite de edição do próprio corista:** telefone e endereço só podem ser alterados **1 vez a cada 10 dias** (cada um conta
  separado); 429 com a data de liberação. Reenviar o mesmo valor sem mudança não conta. Líderes editando a ficha de outra pessoa não
  têm esse limite.
- **Afastamento:** corista com `CORISTA_SOLICITAR_AFASTAMENTO` só **solicita** (`POST /coristas/{id}/solicitar-afastamento`, só se
  `APROVADO`, só uma solicitação pendente por vez — 409). Quem tem `CORISTA_APROVAR_AFASTAMENTO` decide pela fila
  (`GET /solicitacoes-afastamento?status=PENDENTE`) ou direto (`PATCH /coristas/{id}/afastar` / `/retornar-do-afastamento`). Afastado
  não consegue logar (403 com o motivo).
- **Agrupamentos/Subdivisões:** campos obrigatórios variam por `tipo` (tabela na seção "Contrato da API"); tipo `AREA` não tem
  subdivisão criada manualmente — já existe implícita. O `tipo` **não muda** depois de criado (400 se tentar).
- **Congregações:** selects só listam `ativa=true`. Encadear tipo → Agrupamento → Subdivisão (`GET /agrupamentos/{id}/subdivisoes`,
  **pular esse passo quando o tipo é `AREA`** — usar o `id` da única subdivisão direto) → Congregação
  (`GET /congregacoes?subdivisaoId=`). Limpar os níveis abaixo ao trocar um nível acima.
- **Escopo:** `PASTOR` tem 0–2 agrupamentos (campo missionário sempre sozinho); demais papéis, exatamente 1; `ADMIN`/`PASTOR_ADMIN`
  não têm escopo (409 se tentar definir).

## Fluxos Principais

### Auto-cadastro público (tela `02`)

1. **Cascata de localização** (tudo público, sem token):
   1. Tipos (enum fixo): Campo Missionário, Filial, Setor, Área.
   2. `GET /agrupamentos?tipo=AREA&ativo=true` (ou o tipo escolhido) → rótulo conforme a tabela de rótulos.
   3. `GET /agrupamentos/{agrupamentoId}/subdivisoes?ativo=true` → **se o tipo for `AREA`, pular este passo**: vem uma única
      subdivisão sem número nem nome, usar o `id` dela direto. Nos demais tipos o usuário escolhe o Local/Área.
   4. `GET /congregacoes?subdivisaoId={id}&ativa=true` → escolhe a congregação.
2. **Dados pessoais**: nome, data de nascimento (calcular idade em `shared/idade.js` e mostrar `"16 anos · Adolescente"` abaixo do
   campo), tipo de voz, tamanho de camisa (chips, seleção única), ocupação (opcional). Nota: "A lista é definida automaticamente
   pela idade".
3. **Se menor de 18:** exibir o bloco Responsável legal com alerta LGPD; nome, telefone e checkbox de consentimento tornam-se
   obrigatórios (`superRefine` no Zod). Se ≥ 18: esconder o bloco e **não enviar** esses campos.
4. **Endereço** (opcional): CEP (ViaCEP) → preenche logradouro/bairro/cidade/UF, número e complemento digitados (seção de CEP
   abaixo). Campos continuam editáveis.
5. **Login:** e-mail e senha (regra acima) + confirmação de senha (só do front).
6. `POST /coristas` com tudo junto (exemplo na seção "Contrato da API"). Resposta `201`: cadastro criado como **`PENDENTE`**. Mostrar
   "Cadastro enviado. Aguarde a aprovação da liderança."
7. Enquanto `PENDENTE`, o login responde 403 com o motivo; depois de `APROVADO`, funciona.

> **Lacuna conhecida:** telefone do próprio corista **não** entra no auto-cadastro — cadastrar depois do primeiro login (tela "Meu
> perfil").

### Meu perfil (corista)

- `GET /coristas/meu` → o cadastro do usuário logado (`pessoa.id` serve para telefone/endereço).
- Editar: `PUT /coristas/{id}` com o corpo **completo**. Não altera a própria data de nascimento. Pode mudar de congregação só
  dentro do mesmo agrupamento.
- Telefones: `/pessoas/{pessoaId}/telefones`. Endereço: `PUT /enderecos/{id}` ou pelo próprio `PUT /coristas/{id}`.
- **Limite de 10 dias** para telefone e endereço (ver "Regras de Negócio").

Telefones: o primeiro cadastrado vira principal automaticamente; `principal: true` em outro troca o principal; `false`/ausente não
rebaixa. Enviar com ou sem máscara (a API grava só dígitos); formatar os dígitos na exibição.

### Aprovação de cadastros (liderança)

1. `GET /coristas?status=PENDENTE` (paginado, já restrito ao recorte/escopo de quem chama).
2. Detalhe: `GET /coristas/{id}`.
3. `PATCH /coristas/{id}/aprovar` ou `/reprovar` (sem corpo; autor é o usuário logado). Só vale a partir de `PENDENTE` (409 senão).
4. Quem aprova o quê: adolescentes — `DIRIGENTE_UNIAO` e líderes; jovens — `LIDERANCA_GRUPO_JOVEM`, `DIRIGENTE_CAMPANHA` e líderes.

### Afastamento

- Solicitar (quem só tem `CORISTA_SOLICITAR_AFASTAMENTO`): `POST /coristas/{id}/solicitar-afastamento` `{ motivo }` → 201.
- Decidir (`CORISTA_APROVAR_AFASTAMENTO`): fila `GET /solicitacoes-afastamento?status=PENDENTE`; `PATCH
  /solicitacoes-afastamento/{id}/aprovar` (pessoa vira `AFASTADO`, perde acesso na hora) ou `/negar`.
- Direto: `PATCH /coristas/{id}/afastar` e `/retornar-do-afastamento`.

### Promoção (só `LIDER_MOCIDADE`/`CORISTA_PROMOVER`)

`PATCH /coristas/{id}/promover`, com confirmação na tela (irreversível).

### Administração (ADMIN / PASTOR_ADMIN e afins)

- **Estrutura:** cadastrar/editar/inativar agrupamentos e subdivisões (`AGRUPAMENTO_GERENCIAR`). Tipo `AREA` não tem subdivisão
  manual. `DELETE` é soft, 409 se tem congregação ativa dentro.
- **Congregações:** quem tem `CONGREGACAO_GERENCIAR` cria/edita/move/inativa dentro dos **seus** agrupamentos (403 fora).
- **Usuários:** criar login para uma pessoa (`POST /usuarios`), com `roleIds` vindos de `GET /roles`. `ADMIN`/`PASTOR_ADMIN` só
  concedidos pelo `ADMIN`; `PASTOR_ADMIN` só concede `PASTOR`.
- **Escopo:** `GET`/`PUT /usuarios/{id}/agrupamentos`. Pastor: 0–2 (campo missionário sozinho); outros: exatamente 1; ADMIN/
  PASTOR_ADMIN: nenhum (409 se tentar).
- **Papéis:** `ROLE_SOLICITAR` pede papel novo (nasce `PENDENTE` e inativo) → `ROLE_APROVAR` decide → `ROLE_GERENCIAR_PERMISSOES`
  define as permissões (`PUT /roles/{id}/permissoes`).

### Dashboard da liderança / pastor (tela `03`)

Layout com sidebar. Blocos: KPIs (coristas aprovados, aguardando aprovação, jovens · adolescentes, congregações ativas), gráfico de
barras por naipe e barras horizontais por congregação (Recharts), tabela "Cadastros pendentes" (`GET /coristas?status=PENDENTE`,
sinalizando menores), aniversariantes do mês, contagem de camisas por tamanho.

**Não existem endpoints de agregação.** Derivar números das listagens (`GET ...&size=1` + `page.totalElements`). Para o pastor,
buscar primeiro `GET /usuarios/meu/agrupamentos` e filtrar as listagens por `agrupamentoId`. Se ficar pesado, **propor endpoint
`/dashboard` no backend** em vez de baixar tudo no front. O **mapa das congregações** é do front (Leaflet + OpenStreetMap); o backend
ainda não tem latitude/longitude na congregação — geocodificar no front a partir do CEP por ora.

### Dashboard do corista (tela `04`)

Topbar simples. Boas-vindas com status do cadastro, perfil no coral (naipe, lista, camisa, desde), linha do tempo do cadastro,
contatos com "Atualizar meus dados", avisos da liderança e agenda com badge **"Em breve"**. Avisos ainda não têm endpoint: usar dados
mockados isolados em `features/dashboard/mocks.js`, fáceis de remover.

## Endereço e CEP

A API **não consulta CEP** — isso é do front. Fluxo: front consulta o CEP, preenche o formulário, usuário completa número e
complemento, front envia o endereço completo para a API gravar. Endereço sempre vai **aninhado** (`pessoa.endereco`,
`congregacao.endereco`) ou, solto, em `POST /enderecos`.

```js
// ViaCEP: gratuito e público, não faz parte da API
async function buscarCep(cep) {
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) return null;
  const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  const dados = await resposta.json();
  if (dados.erro) return null; // CEP não encontrado
  return { logradouro: dados.logradouro, bairro: dados.bairro, cidade: dados.localidade, uf: dados.uf, cep: dados.cep };
}
```

Mapa de campos ViaCEP: `logradouro`→`logradouro`, `bairro`→`bairro`, **`localidade`→`cidade`**, `uf`→`uf`, `cep`→`cep`. `numero` e
`complemento` são digitados (ViaCEP não os fornece). Buscar ao completar 8 dígitos (ou no blur), mostrar "carregando", permitir
**preenchimento manual** se o CEP falhar ou não existir (zona rural pode não ter CEP), deixar `logradouro`/`bairro` editáveis.

Formatação: a API devolve `cep` só com dígitos (`50050000`) — formatar `00000-000` na tela. Telefone também volta só com dígitos.

## Rotas (front)

```
/login                      público
/cadastro                   público (self-service de corista)
/cadastro/concluido         público
/lideranca                  LayoutLideranca → DashboardLideranca            (DASHBOARD_LER)
/lideranca/coristas         lista paginada + filtros                        (CORISTA_LER)
/lideranca/coristas/novo
/lideranca/coristas/:id     detalhe/edição + telefones                      (CORISTA_ATUALIZAR)
/lideranca/aprovacoes       lista de PENDENTES                              (CORISTA_APROVAR | CORISTA_REPROVAR)
/lideranca/afastamentos     fila de solicitações                           (CORISTA_APROVAR_AFASTAMENTO)
/lideranca/pessoas                                                          (PESSOA_LER)
/lideranca/congregacoes                                                     (CONGREGACAO_GERENCIAR)
/lideranca/agrupamentos                                                     (AGRUPAMENTO_GERENCIAR)
/lideranca/usuarios                                                         (USUARIO_GERENCIAR)
/lideranca/escopo                                                           (ESCOPO_GERENCIAR)
/lideranca/papeis                                                           (ROLE_GERENCIAR_PERMISSOES | ROLE_SOLICITAR | ROLE_APROVAR)
/corista                    LayoutCorista → DashboardCorista
/corista/meu-cadastro
/sem-permissao              logado, mas sem a permissão exigida pela rota (403 de UX)
*                           NaoEncontrado
```

Guardas (`RotaProtegida`) recebem `permissoesPermitidas` (lista de permissões, não nomes de papel) — ver "Autenticação e Segurança".

## Pendências do Backend que Bloqueiam o Front

Não implementar gambiarras para contornar; sinalizar e aguardar:

1. **CORS** para o domínio do front em produção — resolvido junto do Auth0.
2. Erro de validação **sem lista de campos** (`errors`): o front precisa validar sozinho (seção "Contrato da API") e já tratar o
   campo `errors` quando ele existir (formato-alvo documentado em "Tratamento de Erros").
3. Telefone do corista **não vai no auto-cadastro** — cadastrar depois do primeiro login.
4. **Envio de e-mail** da redefinição de senha não existe em produção — tela pronta, mas só funciona em prod depois do e-mail (ou
   do Auth0).
5. **Sem refresh token** — sessão de 60 min; ao 401, pedir login de novo.
6. **Sem endpoints de dashboard/agregação** — usar `page.totalElements` com `size=1`.
7. **Mapa:** congregação sem latitude/longitude — geocodificar no front por ora.
8. **Auditoria de leitura** do `PASTOR_ADMIN` (LGPD) ainda não existe.
9. Sem limite de tentativas no `POST /coristas` público (sem proteção anti-abuso ainda).
10. **Auth0** — planejado, não implementado (ver seção dedicada).

## Estratégia de Testes

- **Vitest + Testing Library** para componentes e hooks; **MSW** para mockar a API (handlers em `src/test/handlers.js` com os
  formatos reais dos DTOs).
- Obrigatório testar: schema de corista (menor x maior de idade), fluxo de cadastro em duas etapas (incluindo lacuna do telefone),
  paginação/filtros na URL, mapeamento de erros 400/403/409/429, `temPermissao`/`temAlgumaPermissao`, guarda de rota por permissão.
- `shared/idade.js` e `shared/formatadores.js` com testes unitários de borda (aniversário no dia, 17a 11m 30d, telefone fixo x
  celular).
- Nenhuma funcionalidade nova entra sem teste mínimo do fluxo principal.

## Convenções de Contribuição

- **GitHub Flow**: `main` sempre estável; tudo via Pull Request.
- **Branches**: `feat/<area>-<atividade>`, `fix/<...>`, `chore/<...>`. Uma atividade por branch.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`, `style:`).
- **Definition of Done**: build ok + lint ok + testes verdes + tela conferida contra o Figma (desktop e 390px de largura) + PR revisado.

## Ordem de Construção Sugerida

1. ~~Setup: Vite, Tailwind com tokens, fontes, proxy, `cliente.js`, `QueryClient`, rotas e layouts.~~ **Feito** — revisado para a
   autenticação real e a hierarquia Agrupamento/Subdivisão/Congregação.
2. `shared/ui`: Botao, Campo, Select, Chip, Badge, Card, Tabela, Paginacao, Toast, ConfirmDialog.
3. Agrupamento, Subdivisão e Congregação (CRUD) para validar o padrão api → hooks → componentes → erros, já lidando com os campos
   condicionais por `tipo`.
4. Lista paginada de coristas com filtros na URL (`agrupamentoId`, `subdivisaoId`, `congregacaoId`, `status`, `listaClassificacao`).
5. Cadastro de corista: cascata tipo → agrupamento → subdivisão → congregação, LGPD, ViaCEP, criação de usuário (login) no mesmo
   envio; telefone fica para depois do primeiro login.
6. Detalhe/edição de corista, gestão de telefones, limite de 10 dias (429).
7. Aprovação/reprovação de cadastros, promoção (com confirmação), afastamento (solicitar + fila + decidir).
8. Dashboard da liderança/pastor (contagens via `size=1`) e dashboard do corista.
9. Administração: agrupamentos/subdivisões, usuários, escopo, papéis e permissões.
10. Preparar a troca para Auth0 quando o backend migrar (módulo de auth já isolado desde o passo 1).

## O Que NÃO Fazer

- Não expor nem depender de campos que não estão nos DTOs.
- Não calcular `listaClassificacao` nem `status` no front para enviar à API.
- Não usar `new Date()` com `LocalDate`.
- Não fazer `fetch` direto em componentes.
- Não guardar dados da API em estado global manual.
- Não chamar "Inativar" de "Excluir".
- Não reproduzir o logo institucional; usar o arquivo oficial quando fornecido.
- Não confiar no front para permissões.
- Não enviar o autor de uma ação (`aprovadoPor`, `afastadoPor`, `promovidoPor`...) — é sempre o usuário logado no backend.
- Não decidir UI pelo **nome do papel**; decidir por **permissão**.
- Não deixar o cadastro público escolher papel — é sempre derivado pelo backend.
- Não decodificar o token JWT para extrair permissão; usar sempre os `roles` devolvidos no login.
- Não guardar o token em `localStorage` se puder evitar, e nunca na URL.
