# FinTrack Pro — Contexto do Projeto

> Versão: v7 | MVP | Abril 2025
> App web de finanças pessoais (PF + PJ) para uso próprio. Sem autenticação. Usuário único.

---

## 1. O que é o FinTrack Pro

App de finanças pessoais PF + PJ para uso próprio.
Web app (Next.js 14) acessado pelo celular via browser (PWA).
MVP sem login: app abre direto na Home. Entrada manual.
Backend (Supabase) executa todos os cálculos de projeção.

### Decisão MVP: Sem Login
- `app/layout.tsx` aponta direto para `/dashboard` sem middleware de autenticação
- Row Level Security no Supabase: **desabilitado** ou policy aberta
- Login pode ser adicionado em versão futura sem mudar a estrutura do banco

---

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 App Router + Tailwind CSS v4 + TypeScript |
| UI | Claude Code gera cada tela com prompt dedicado |
| Backend | Supabase (Postgres + Edge Functions + Realtime + pg_cron) |
| IDE | Cursor com Claude Code |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Animação | Framer Motion |
| Deploy | Vercel |

**Sem:** Login/Auth, Figma, React Native, Prisma, App Store, monorepo

---

## 3. Entidades (dados seed)

| ID | Nome | Tipo |
|---|---|---|
| `00000000-0000-0000-0000-000000000001` | Lucas Ferreira | PF |
| `00000000-0000-0000-0000-000000000002` | LF Consultoria LTDA | PJ |

**EntityToggle:** estado global em `lib/entity-context.tsx` — `EntityProvider` no `app/dashboard/layout.tsx`.

Mapeamento:
- **PF** → `00000000-0000-0000-0000-000000000001`
- **PJ** → `00000000-0000-0000-0000-000000000002`
- **Tudo** → usa o ID da PF como primário (dados agregados de ambos no futuro)

Hook de acesso: `useEntity()` — retorna `{ entityFilter, setEntityFilter, entityId, allEntityIds }`

---

## 4. Banco de Dados (15 tabelas)

Schema completo em `supabase/migrations/001_schema.sql`
Types em `lib/database.types.ts` (gerados via `supabase gen types typescript --project-id mxfftcjsvkhraennichu`)

| Tabela | Descrição |
|---|---|
| `entities` | Pessoa física / jurídica — raiz de todos os registros |
| `accounts` | Contas bancárias vinculadas a uma entity |
| `credit_cards` | Cartões de crédito (closing_day, due_day, limit_total) |
| `categories` | Categorias hierárquicas via `parent_id` |
| `transactions` | Lançamentos financeiros — coração do sistema |
| `recurrences` | Despesas/receitas recorrentes (gera transactions via pg_cron) |
| `installments` | Parcelamentos (gera transactions por parcela) |
| `invoices` | Faturas de cartão por ciclo |
| `savings_goals` | Metas de poupança ("caixinhas") |
| `savings_transfers` | Transferências para/de metas |
| `scenarios` | Cenários financeiros hipotéticos |
| `scenario_changes` | Mudanças dentro de um cenário |
| `life_events` | Eventos de vida (casamento, casa, etc.) |
| `net_worth_snapshots` | Snapshots mensais de patrimônio líquido |
| `purchase_decisions` | Simulações de decisão de compra |

---

## 5. Regras Críticas de Negócio

1. **`entity_id` obrigatório** em toda transaction
2. **Tipos de transferência nunca entram em totais de despesa:**
   ```ts
   .not('type', 'in', '(transfer,savings_transfer)')
   ```
3. **Gasto no cartão:** `card_id` preenchido, `account_id = NULL`
   — saída de caixa só ocorre ao pagar a Invoice (fatura)
4. **Recurrences → transactions** via `pg_cron` diário
5. **Installments → N transactions** via trigger PostgreSQL
6. **Renda PJ:** `is_estimated = true` até receber; atualizar `actual_amount` ao confirmar
7. **Savings transfers não são expenses** — filtrar sempre

---

## 6. Edge Functions (`supabase/functions/`)

| Função | O que faz |
|---|---|
| `cashflow-projection` | 12 meses de fluxo de caixa |
| `net-worth-projection` | Patrimônio em anos (5/10/20) |
| `purchase-decision` | Impacto de compra + custo de oportunidade |
| `get-alerts` | Alertas financeiros ativos |
| `generate-recurrences` | Cron diário |
| `close-invoice` | Cron mensal |
| `snapshot-net-worth` | Cron mensal |

---

## 7. Ordem de Desenvolvimento — MVP

| # | Tela | Rota | Status |
|---|---|---|---|
| 1 | **Home (Mapa)** | `/dashboard` | ✅ Criada |
| 2 | **Transações** | `/dashboard/transactions` | ✅ Criada |
| 3 | **Quick Input** | `/dashboard/quick-input` | ✅ Criada |
| 4 | **Projeção** | `/dashboard/projection` | ⏳ Próxima |
| 5 | **Metas** | `/dashboard/goals` | ⏳ |
| 6 | **Devo Comprar?** | `/dashboard/purchase` | ⏳ |
| 7 | **Cenários** | `/dashboard/scenarios` | ⏳ |
| 8 | **Ajustes** | `/dashboard/settings` | ⏳ |

---

## 8. Estrutura de Pastas

```
fintrack-app/
  app/
    layout.tsx                        ← Root layout: Inter, dark, manifest
    page.tsx                          ← redirect → /dashboard
    dashboard/
      layout.tsx                      ← EntityProvider (contexto global de entidade)
      page.tsx                        ← Tela 1: Home (Mapa)
      transactions/page.tsx           ← Tela 2: Lista de transações (Realtime)
      quick-input/page.tsx            ← Tela 3: Entrada rápida
      projection/page.tsx             ← Tela 4: Projeção (Edge Function)
      goals/page.tsx                  ← Tela 5: Caixinhas
      purchase/page.tsx               ← Tela 6: Devo comprar? (Edge Function)
      scenarios/page.tsx              ← Tela 7: Cenários
      settings/page.tsx               ← Tela 8: Ajustes

  components/
    HomeClient.tsx                    ← Client Component da Home
    layout/
      BottomNav.tsx                   ← Nav fixa com botão (+) flutuante
      EntityToggle.tsx                ← Pill switch PF | PJ | Tudo
    transactions/
      TransactionRow.tsx
      TransactionList.tsx
      MonthSelector.tsx
      FilterChips.tsx
    quick-input/
      TypeSelector.tsx
      NumericKeypad.tsx
      CategoryBottomSheet.tsx
      AccountSelector.tsx
    ui/
      BottomSheet.tsx                 ← Radix Dialog + framer-motion

  hooks/
    useHomeData.ts                    ← 3 queries paralelas: snapshots + transactions + goals
    useTransactions.ts                ← Query + Realtime + totais
    useNetWorth.ts                    ← (a criar)
    useGoals.ts                       ← (a criar)
    useCashflow.ts                    ← (a criar — Edge Function)

  lib/
    supabase/
      client.ts                       ← createBrowserClient
      server.ts                       ← createServerClient
    database.types.ts                 ← gerado pelo Supabase CLI
    utils.ts                          ← cn, formatCurrency, formatDate, formatRelativeDate
    entity-context.tsx                ← EntityProvider + useEntity()

  middleware.ts                       ← Refresh de sessão (sem proteção de rota)
```

---

## 9. Supabase — Referências

- **Project ID:** `mxfftcjsvkhraennichu`
- **Nome:** fintrack-pro
- **Região:** sa-east-1
- **URL:** `https://mxfftcjsvkhraennichu.supabase.co`
- **Anon Key:** em `.env.local` como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 10. Design System — Referência Rápida

> Arquivo completo: `DESIGN_SYSTEM.md`

```
background  #0A0F1E   ← bg-[#0A0F1E]
surface     #111827   ← bg-[#111827]
elevated    #1C2537   ← bg-[#1C2537]
subtle      #1E2A3B   ← hover / border

accent      #14A085   ← CTAs, ativo
positive    #22C55E   ← receitas
negative    #EF4444   ← despesas
warning     #F59E0B   ← alertas / estimados

text-primary    #F8FAFC
text-secondary  #94A3B8
text-muted      #475569
border          #1E293B
border-active   #14A085
```

**Regras inegociáveis:**
1. Nunca hardcode cores fora dos tokens acima
2. `tabular-nums` em todo valor monetário
3. `formatCurrency()` / `formatDate()` de `lib/utils.ts` — nunca inline
4. `transition-all duration-200 ease-out` em elementos interativos
5. `scrollbar-hide` em listas horizontais

---

## 11. Padrões de Código

### Buscar dados (Client Component)
```tsx
import { useEntity } from '@/lib/entity-context'
const { entityId } = useEntity()
// usar entityId nas queries — nunca hardcodar 'ENT-001'
```

### Buscar dados (Server Component)
```tsx
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data } = await supabase.from('transactions').select('*')
```

### Types do banco
```tsx
import type { Database } from '@/lib/database.types'
type Transaction = Database['public']['Tables']['transactions']['Row']
```

---

## 12. Fluxo de Desenvolvimento por Tela

1. Claude Code recebe prompt da tela
2. Gera componentes (Server ou Client conforme necessidade)
3. Cursor aplica o código
4. Testar com dados reais do Supabase
5. Testar interações e edge cases
6. Próxima tela

**Regra:** cada tela deve funcionar com dados reais antes de avançar.

> **Nota:** neste projeto, o Claude Code já gera as telas conectadas ao Supabase desde o início (sem dados mockados). Os passos 1-2 do fluxo original de "substituir mock por real" não se aplicam aqui — o código sai pronto para testar.

---

## 13. Checklist de Conexão ao Banco (por tela)

Após gerar o código de uma tela:

- [ ] Verificar se `useEntity()` está sendo usado (nunca hardcodar `'ENT-001'`)
- [ ] Confirmar que o filtro de transfer está presente onde necessário:
  `.not('type', 'in', '(transfer,savings_transfer)')`
- [ ] Abrir `localhost:3000` e verificar se os dados do seed aparecem
- [ ] Verificar erros no terminal do Cursor
- [ ] Inserir dados via Quick Input e confirmar que a tela atualiza (Realtime)
- [ ] Testar no celular via IP local (aparece no terminal do `npm run dev`)

---

## 14. Edge Functions — Setup e Deploy

> **Pré-requisito:** Supabase CLI instalado (ver seção 15)

### 14.1 Inicializar e linkar CLI

```bash
# Na raiz do projeto (fintrack-app/)
supabase init

# Linkar ao projeto remoto
supabase link --project-ref mxfftcjsvkhraennichu

# Verificar status
supabase status
```

### 14.2 Criar Edge Functions

Para cada função, criar o arquivo em `supabase/functions/[NOME]/index.ts`.
Usar o prompt abaixo no Claude Code substituindo `[NOME_DA_FUNCAO]` e descrevendo a lógica:

```
Crie uma Supabase Edge Function chamada [NOME_DA_FUNCAO].
Arquivo: supabase/functions/[NOME_DA_FUNCAO]/index.ts

A função deve:
1. Aceitar POST request com body JSON
2. Criar um client Supabase usando o service role key do environment
3. Executar a lógica de cálculo
4. Retornar JSON com os resultados
5. Tratar erros com status code 400/500 adequado

Headers: Access-Control-Allow-Origin: * (necessário para browser)

[DESCREVER A LÓGICA ESPECÍFICA]
```

### 14.3 Funções a criar (ordem recomendada)

| Função | Quando criar | Lógica |
|---|---|---|
| `cashflow-projection` | Antes da Tela 4 | 12 meses: recurrences + installments + transactions planejadas |
| `net-worth-projection` | Antes da Tela 4 | Patrimônio projetado em 5/10/20 anos |
| `purchase-decision` | Antes da Tela 6 | Impacto na renda + custo de oportunidade |
| `get-alerts` | Qualquer momento | Cashflow negativo, renda variável, faturas vencendo |
| `generate-recurrences` | Antes do go-live | Cron diário — gera transactions de recurrences |
| `close-invoice` | Antes do go-live | Cron mensal — fecha faturas |
| `snapshot-net-worth` | Antes do go-live | Cron mensal — salva snapshot de patrimônio |

### 14.4 Deploy das funções

```bash
# Deploy de uma função específica
supabase functions deploy cashflow-projection

# Deploy de todas as funções de uma vez
supabase functions deploy

# Verificar no dashboard: Supabase → Edge Functions
```

---

## 15. Supabase CLI — Instalação no Windows

O `npm install -g supabase` **não funciona** no Windows. Usar `winget`:

```bash
winget install Supabase.CLI
# Reiniciar o terminal após instalação

# Verificar
supabase --version
```

Alternativa via Scoop:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

> Para gerar types após criar/alterar tabelas:
> ```bash
> supabase gen types typescript --project-id mxfftcjsvkhraennichu > lib/database.types.ts
> ```

---

## 16. Deploy no Vercel

### Passo a passo

1. **Criar repositório no GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   # Criar repo no github.com e fazer push
   ```

2. **Criar conta na Vercel** — vercel.com, entrar com GitHub (gratuito)

3. **Importar projeto** — Dashboard Vercel → "Add New Project" → selecionar `fintrack-app`

4. **Variáveis de ambiente** — antes de confirmar o deploy, adicionar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (mesmos valores do `.env.local`)

5. **Deploy** — clicar "Deploy". Aguardar ~2 min. URL gerada: `https://fintrack-app.vercel.app`

6. **Instalar como PWA no celular**
   - **iPhone (Safari):** Compartilhar → "Adicionar à Tela de Início"
   - **Android (Chrome):** Menu → "Adicionar à tela inicial"

### PWA — manifest.json

Arquivo já referenciado no `app/layout.tsx`. Criar em `public/manifest.json` (ver seção 17).

---

## 17. PWA — Configuração

### `public/manifest.json` (já criado ✅)

```json
{
  "name": "FinTrack Pro",
  "short_name": "FinTrack",
  "description": "Sistema financeiro pessoal",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0A0F1E",
  "theme_color": "#14A085",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Meta tags no `app/layout.tsx` (adicionar quando for testar PWA)

```tsx
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#14A085" />
```

> **Ícones:** criar `public/icons/icon-192.png` e `public/icons/icon-512.png`.
> Usar qualquer ferramenta de geração de ícones PWA com o logo do FinTrack.
