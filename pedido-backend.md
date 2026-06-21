# Pedido ao Backend — Endpoints faltantes (Métodos de Pagamento e Ícones)

> Documento de solicitação do **frontend admin** ao time de backend.
> O painel admin tem duas telas (`/metodos-pagamento` e `/icons`) que hoje funcionam **apenas com dados mockados** porque não existem endpoints correspondentes no [mapeamento de rotas atual](./mapeamento-rotas.md).
> Ambas as funcionalidades são necessárias para o produto:
> - **Métodos de pagamento** precisam estar **ligados aos pedidos** (o cliente escolhe a forma de pagamento no checkout).
> - **Ícones** serão usados em **vários locais do sistema** para exibição das categorias (e potencialmente dos métodos de pagamento).
>
> Abaixo está o contrato esperado pelo frontend, seguindo as convenções já em uso (envelope `TransformInterceptor`, JWT global, `@Roles`, `ValidationPipe` com `whitelist`, imagens no MinIO).

---

## Sumário

- [Convenções (reaproveitadas do mapeamento atual)](#convenções-reaproveitadas-do-mapeamento-atual)
- [1. Métodos de Pagamento](#1-métodos-de-pagamento)
  - [1.1 Endpoints CRUD](#11-endpoints-crud)
  - [1.2 DTOs](#12-dtos)
  - [1.3 Vínculo com Pedidos (alterações em `/orders`)](#13-vínculo-com-pedidos-alterações-em-orders)
- [2. Ícones](#2-ícones)
  - [2.1 Endpoints CRUD](#21-endpoints-crud)
  - [2.2 DTOs](#22-dtos)
  - [2.3 Vínculo com Categorias (alterações em `/categories`)](#23-vínculo-com-categorias-alterações-em-categories)
- [3. Roteamento no Gateway](#3-roteamento-no-gateway)
- [4. Resumo das rotas solicitadas](#4-resumo-das-rotas-solicitadas)

---

## Convenções (reaproveitadas do mapeamento atual)

- **Envelope de resposta**: todas as respostas no padrão `{ data, status: { code, message }, pagination? }`.
- **Auth**: JWT global; rotas de escrita restritas a `ADMIN` via `@Roles`. Leitura conforme indicado por endpoint.
- **Validação**: `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- **Status HTTP**: default do Nest (`201` POST, `200` GET/PUT/PATCH/DELETE).
- **Imagens**: upload `multipart/form-data` armazenado no MinIO (mesmo fluxo de `canteens/logo` e `institutions/photo`).
- **Soft delete**: seguir o padrão já adotado (cantinas, produtos, usuários).

---

## 1. Métodos de Pagamento

**Serviço sugerido:** `orders` (`:4003`) — por estarem intrinsecamente ligados aos pedidos.
**Prefixo de recurso:** `/payment-methods`.

Catálogo **global** de formas de pagamento, gerenciado pelo ADMIN. O app cliente lista as formas **ativas** no checkout e o pedido guarda a forma escolhida (snapshot).

### 1.1 Endpoints CRUD

| # | Método / Path | Auth | Body / Params / Query | Response | Mensagem sugerida |
|---|---|---|---|---|---|
| 1 | `POST /payment-methods` | ADMIN | `CreatePaymentMethodDto` | `PaymentMethodResponseDto` | Método de pagamento criado com sucesso |
| 2 | `GET /payment-methods` | qualquer JWT | query: `onlyActive?` (default `false` p/ admin; o app envia `true`) | `PaymentMethodResponseDto[]` | Métodos de pagamento listados |
| 3 | `GET /payment-methods/:id` | qualquer JWT | `id` (UUID) | `PaymentMethodResponseDto` | Método encontrado |
| 4 | `PUT /payment-methods/:id` | ADMIN | `id` (UUID) + `UpdatePaymentMethodDto` | `PaymentMethodResponseDto` | Método atualizado com sucesso |
| 5 | `PATCH /payment-methods/:id/toggle` | ADMIN | `id` (UUID) | `PaymentMethodResponseDto` | Status do método atualizado |
| 6 | `DELETE /payment-methods/:id` | ADMIN | `id` (UUID) | `null` | Método removido com sucesso (soft delete) |

> O endpoint `toggle` (4 → 5) atende o switch Ativo/Inativo da tela admin sem precisar reenviar o objeto inteiro.

### 1.2 DTOs

- **`CreatePaymentMethodDto`**
  - `name` (string, obrigatório, ≤100) — ex.: `"PIX"`, `"Cartão de Crédito"`.
  - `description?` (string, ≤255) — ex.: `"Transferência instantânea"`.
  - `type` (enum **`PaymentMethodType`**, obrigatório) — `PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `CASH`, `DIGITAL_WALLET`.
  - `iconKey?` (string, ≤50) — referência opcional a um ícone (ver seção 2).
  - `displayOrder?` (int ≥0, default 0) — ordem de exibição.
  - `isActive?` (boolean, default `true`).
- **`UpdatePaymentMethodDto`** — todos os campos opcionais (`name?`, `description?`, `type?`, `iconKey?`, `displayOrder?`, `isActive?`).
- **`PaymentMethodResponseDto`** — `id`, `name`, `description|null`, `type`, `iconKey|null`, `isActive`, `displayOrder`, `createdAt`.

### 1.3 Vínculo com Pedidos (alterações em `/orders`)

Hoje `POST /orders` monta o pedido a partir do carrinho **sem body**. Solicitamos:

1. **`POST /orders`** passa a aceitar body **`CreateOrderDto`**:
   - `paymentMethodId` (UUID, **obrigatório**) — deve existir e estar ativo (`404` se inexistente, `409` se inativo).
2. **`OrderResponseDto`** ganha os campos (snapshot no momento da compra, como já é feito com nome/preço dos itens):
   - `paymentMethodId` (UUID)
   - `paymentMethodNameSnapshot` (string)
   - `paymentMethodType` (`PaymentMethodType`)

> ⚠️ Mudança potencialmente **breaking** em `POST /orders` (passa a exigir `paymentMethodId`). Combinar a estratégia de rollout com o app cliente.

---

## 2. Ícones

**Serviço sugerido:** `catalog` (`:4002`) — as categorias vivem aqui e o serviço já lida com MinIO.
**Prefixo de recurso:** `/icons`.

Biblioteca **global** de ícones gerenciada pelo ADMIN. Cada ícone tem uma `key` única (slug) que é referenciada por outras entidades (hoje as **categorias** via `iconKey`; futuramente também os métodos de pagamento).

### 2.1 Endpoints CRUD

| # | Método / Path | Auth | Body / Params / Query | Response | Mensagem sugerida |
|---|---|---|---|---|---|
| 1 | `POST /icons` | ADMIN | `multipart/form-data`: `CreateIconDto` + `file` (SVG/PNG) | `IconResponseDto` | Ícone criado com sucesso |
| 2 | `GET /icons` | **Public** | query: `tag?`, `search?` | `IconResponseDto[]` | Ícones listados com sucesso |
| 3 | `GET /icons/:id` | **Public** | `id` (UUID) | `IconResponseDto` | Ícone encontrado |
| 4 | `PUT /icons/:id` | ADMIN | `id` (UUID) + `multipart/form-data`: `UpdateIconDto` + `file?` | `IconResponseDto` | Ícone atualizado com sucesso |
| 5 | `DELETE /icons/:id` | ADMIN | `id` (UUID) | `null` | Ícone removido com sucesso |

> Leitura **pública** (como `GET /categories`) para que o app e o admin consigam renderizar/escolher ícones sem fricção.
> `DELETE` deve **bloquear** (`409`) se o ícone estiver em uso por alguma categoria (espelha a regra de `DELETE /categories/:id`).

### 2.2 DTOs

- **`CreateIconDto`**
  - `key` (string, obrigatório, **único**, ≤50, slug `^[a-z0-9-]+$`) — ex.: `"pizza"`, `"coffee"`, `"ice-cream"`.
  - `name` (string, obrigatório, ≤100) — rótulo amigável, ex.: `"Pizza"`.
  - `tag?` (string, ≤50) — agrupamento, ex.: `"comida"`, `"bebida"`.
  - `file` (arquivo binário SVG/PNG) — armazenado no MinIO.
- **`UpdateIconDto`** — `name?`, `tag?`, `file?` (a `key` é imutável após criação para não quebrar referências).
- **`IconResponseDto`** — `id`, `key`, `name`, `url` (MinIO), `tag|null`, `createdAt`.

### 2.3 Vínculo com Categorias (alterações em `/categories`)

As categorias já possuem o campo `iconKey`. Solicitamos:

1. **Validação** (recomendada): `iconKey` em `CreateCategoryDto`/`UpdateCategoryDto` deve referenciar uma `key` existente em `/icons` (`400`/`404` se inválida).
2. **`CategoryResponseDto`** ganha o campo **`iconUrl` (string|null)** — a URL do ícone resolvida a partir do `iconKey`, para o app exibir a categoria sem fazer um segundo request.

> Com isso, o seletor "Key do Ícone" na tela de Categorias do admin vira um **dropdown** alimentado por `GET /icons`, e a listagem de categorias passa a exibir o ícone real.

---

## 3. Roteamento no Gateway

Adicionar os dois novos prefixos ao dispatcher (`resolveService` em `services/gateway/src/main.ts`):

```
/payment-methods   → orders   (:4003)
/icons             → catalog  (:4002)
```

Ambos seguem o roteamento por prefixo de recurso já existente; nenhum override especial é necessário.

---

## 4. Resumo das rotas solicitadas

| Método | Path | Serviço | Auth |
|---|---|---|---|
| POST | /payment-methods | orders | ADMIN |
| GET | /payment-methods | orders | JWT |
| GET | /payment-methods/:id | orders | JWT |
| PUT | /payment-methods/:id | orders | ADMIN |
| PATCH | /payment-methods/:id/toggle | orders | ADMIN |
| DELETE | /payment-methods/:id | orders | ADMIN |
| POST | /icons | catalog | ADMIN |
| GET | /icons | catalog | Public |
| GET | /icons/:id | catalog | Public |
| PUT | /icons/:id | catalog | ADMIN |
| DELETE | /icons/:id | catalog | ADMIN |

**Alterações em endpoints existentes:**

| Endpoint | Alteração |
|---|---|
| `POST /orders` | passa a aceitar `CreateOrderDto { paymentMethodId }` (obrigatório) |
| `OrderResponseDto` | + `paymentMethodId`, `paymentMethodNameSnapshot`, `paymentMethodType` |
| `CreateCategoryDto` / `UpdateCategoryDto` | `iconKey` validado contra `/icons` |
| `CategoryResponseDto` | + `iconUrl` (resolvido a partir de `iconKey`) |

---

> Assim que esses endpoints existirem, o frontend admin substitui os dados mockados de `/metodos-pagamento` e `/icons` por integração real (criando `src/lib/paymentMethods.ts` e `src/lib/icons.ts` no mesmo padrão dos services atuais).
