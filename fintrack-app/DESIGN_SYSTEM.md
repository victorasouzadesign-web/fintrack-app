# FinTrack Pro — Design System

> Incluir este documento **integralmente** em todos os prompts de tela.
> Estética: fintech premium dark. Inspiração: Linear, Vercel Dashboard, Raycast.
> Sensação: denso de informação, limpo, sem exageros. Cada elemento tem função.
> Movimento: transições suaves 200ms ease. Hover states sempre presentes.

---

## Stack

- **Tailwind CSS v4** — configuração via `@theme` em `app/globals.css` (sem `tailwind.config.ts`)
- **Next.js 14 (App Router)**
- **Dark mode:** sempre ativo via classe `.dark` no `<html>` — sem toggle no MVP

---

## 1. Paleta de Cores

### Fundos (camadas de profundidade)
| Variável CSS | Hex | Token Tailwind | Uso |
|---|---|---|---|
| `--bg-base` | `#0A0F1E` | `bg-background` | Fundo principal da página |
| `--bg-surface` | `#111827` | `bg-surface` | Cards, painéis, sidebars |
| `--bg-elevated` | `#1C2537` | `bg-elevated` | Dropdowns, modais, elementos elevados |
| `--bg-subtle` | `#1E2A3B` | `bg-subtle` | Hover states, seleções |

### Acento
| Variável CSS | Hex | Token Tailwind | Uso |
|---|---|---|---|
| `--accent-primary` | `#14A085` | `bg-accent` / `text-accent` | CTAs, links, highlights, borders ativos |
| `--accent-teal` | `#0D7377` | `bg-accent-dark` | Secundário, hover do accent |

### Semânticas
| Variável CSS | Hex | Token Tailwind | Uso |
|---|---|---|---|
| `--positive` | `#22C55E` | `text-positive` / `bg-positive` | Receitas, crescimento, sucesso |
| `--negative` | `#EF4444` | `text-negative` / `bg-negative` | Despesas, alertas, erros |
| `--warning` | `#F59E0B` | `text-warning` / `bg-warning` | Estimativas, atenção, parcelamentos |

### Texto
| Variável CSS | Hex | Token Tailwind | Uso |
|---|---|---|---|
| `--text-primary` | `#F8FAFC` | `text-text-primary` | Texto principal, valores, títulos |
| `--text-secondary` | `#94A3B8` | `text-text-secondary` | Labels, subtextos |
| `--text-muted` | `#475569` | `text-text-muted` | Placeholders, disabled, captions |

### Bordas
| Variável CSS | Hex | Token Tailwind | Uso |
|---|---|---|---|
| `--border` | `#1E293B` | `border-border` | Borda sutil entre elementos |
| `--border-active` | `#14A085` | `border-border-active` | Foco, ativo, selecionado |

---

## 2. Tipografia

- **Fonte:** Inter — importada via `next/font/google`, CSS var `--font-inter`
- **Regra:** `font-variant-numeric: tabular-nums` em **TODOS** os valores monetários

| Role | Classes Tailwind |
|---|---|
| `hero-number` | `text-5xl font-bold tracking-tight tabular-nums` |
| `section-title` | `text-sm font-semibold tracking-widest uppercase text-[#94A3B8]` |
| `card-title` | `text-base font-semibold text-[#F8FAFC]` |
| `body` | `text-sm font-normal text-[#94A3B8]` |
| `caption` | `text-xs font-normal text-[#475569]` |
| `value-large` | `text-2xl font-bold tabular-nums` |
| `value-medium` | `text-lg font-semibold tabular-nums` |
| `value-small` | `text-sm font-medium tabular-nums` |

---

## 3. Espaçamento (base 4px)

| Aplicação | Classes |
|---|---|
| Padding de cards | `p-4` (16px) ou `p-5` (20px) |
| Gap entre cards | `gap-3` (12px) ou `gap-4` (16px) |
| Padding de página | `px-4 py-4` (mobile) / `px-6 py-6` (desktop) |
| Margem entre seções | `mb-6` ou `mb-8` |

---

## 4. Border Radius

| Elemento | Classe | Valor |
|---|---|---|
| Cards e painéis | `rounded-xl` | 12px |
| Botões primários | `rounded-lg` | 8px |
| Inputs | `rounded-lg` | 8px |
| Chips e badges | `rounded-full` | — |
| Modais | `rounded-2xl` | 16px |

---

## 5. Sombras

```
cards:       shadow-[0_0_0_1px_rgba(255,255,255,0.05)]
elevated:    shadow-[0_4px_24px_rgba(0,0,0,0.4)]
glow accent: shadow-[0_0_20px_rgba(20,160,133,0.15)]
```

---

## 6. Hierarquia de Superfícies

```
#0A0F1E  background  ← página
  └─ #111827  surface    ← cards e seções
       └─ #1C2537  elevated   ← modais, popovers
            └─ #1E2A3B  subtle     ← hover, linhas
```

---

## 7. Componentes Base

> Usar exatamente estas classes em todas as telas. Não criar variações sem motivo.

### Card padrão
```tsx
<div className="bg-[#111827] rounded-xl p-4 border border-[#1E293B] hover:border-[#1C3A50] transition-colors duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
```

### Botão primário
```tsx
<button className="bg-[#14A085] hover:bg-[#0D7377] text-white font-semibold rounded-lg px-4 py-2.5 transition-all duration-200 active:scale-[0.98]">
```

### Botão secundário
```tsx
<button className="bg-[#1C2537] hover:bg-[#263347] text-[#94A3B8] border border-[#1E293B] rounded-lg px-4 py-2.5 transition-all duration-200">
```

### Input padrão
```tsx
<input className="bg-[#0A0F1E] border border-[#1E293B] focus:border-[#14A085] rounded-lg px-3 py-2.5 text-[#F8FAFC] text-sm outline-none transition-colors duration-200 w-full placeholder:text-[#475569]" />
```

### Chip / Badge
```tsx
{/* Positivo */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#14A085]/10 text-[#14A085] border border-[#14A085]/20">

{/* Negativo */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">

{/* Neutro */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1C2537] text-[#94A3B8] border border-[#1E293B]">
```

### Valores monetários
```tsx
{/* Positivo */}
<span className="text-[#22C55E] font-semibold tabular-nums">

{/* Negativo */}
<span className="text-[#EF4444] font-semibold tabular-nums">

{/* Neutro */}
<span className="text-[#F8FAFC] font-semibold tabular-nums">
```

---

## 8. Layout Mobile-First

- **Container:** `max-w-md mx-auto` (390px) em mobile
- **Bottom nav:** `fixed bottom-0`, altura `64px`, `bg-[#111827] border-t border-[#1E293B]`
- **Safe area:** `pb-safe` — padding-bottom para notch iPhone
- **Scroll:** `overflow-y-auto` com `-webkit-overflow-scrolling: touch`
- **Scrollbar:** `scrollbar-hide` em listas horizontais e painéis com scroll interno

---

## 9. Animações

| Aplicação | Classes / Biblioteca |
|---|---|
| Transições gerais | `transition-all duration-200 ease-out` |
| Entrada de elementos | `animate-in fade-in slide-in-from-bottom-4 duration-300` |
| Count-up em valores | `framer-motion` — animar valores monetários grandes |
| Skeleton loading | `animate-pulse bg-[#1C2537] rounded` |
| Hover interativos | `hover:scale-[1.02]` ou `active:scale-[0.98]` em botões |

---

## 10. Ícones

- **Biblioteca:** `lucide-react`
- **Tamanhos:** `size={16}` inline / `size={20}` botões / `size={24}` hero
- **Cor:** herdar do texto pai (`currentColor`) — nunca hardcoded

---

## 11. Gráficos (Recharts)

- Cores: sempre dos tokens do design system
- Sem eixos desnecessários em sparklines
- `Area` com `fill` usando gradiente do `--positive` ou `--accent`
- Tooltips com `bg-[#1C2537]` e `border border-[#1E293B]`

---

## 12. Utilitários (`lib/utils.ts`)

| Função | Exemplo |
|---|---|
| `cn(...classes)` | Merge de classes Tailwind condicionais |
| `formatCurrency(1234.56)` | `"R$ 1.234,56"` |
| `formatDate("2026-04-16")` | `"16/04/2026"` |
| `formatRelativeDate("2026-04-16")` | `"Hoje"` / `"Ontem"` / `"Qua, 15 abr"` |

---

## 13. Regras Inegociáveis

1. **Nunca usar cores hardcoded** que não sejam os tokens acima
2. **Valores monetários:** sempre `tabular-nums` + `formatCurrency()` — nunca formatar inline
3. **Datas:** sempre `formatRelativeDate()` ou `formatDate()` — nunca `new Date().toLocaleDateString()` inline
4. **Bordas:** `border-[#1E293B]` padrão; `border-[#14A085]` apenas em ativo/focus
5. **Transições:** sempre `transition-all duration-200 ease-out` em elementos interativos
6. **Rounded:** `rounded-xl` cards, `rounded-lg` inputs/botões, `rounded-full` badges/avatares, `rounded-2xl` modais
7. **Sombra em cards:** sempre `shadow-[0_0_0_1px_rgba(255,255,255,0.05)]` para dar profundidade sutil
8. **Hover states:** obrigatórios em todos os elementos clicáveis
