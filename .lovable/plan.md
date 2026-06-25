# Splitwise Lite — Implementation Plan

Backend-first per your instruction. Stack-fit note: project is TanStack Start (React + TS + Vite, Cloudflare Worker runtime). The PRD's Express folder layout will be mapped 1:1 onto TanStack server routes; same layers, same responsibilities, no Express needed. In-memory store (module-level Map) per MVP. No DB, no auth.

## Fixed scope (from PRD, MVP only)
- Hardcoded users: Amit, Rahul, Sneha
- Add expense, list expenses, get optimized settlements
- Server owns all business logic + validation
- Two-decimal currency precision, ignore <0.01 in settlements

---

## Step 1 — Backend: domain, validation, business logic (pure, no HTTP)

Folder layout under `src/`:
```
lib/splitwise/
  users.ts              # USERS = ['Amit','Rahul','Sneha']
  types.ts              # Expense, Split, Settlement, NetBalance
  repository.ts         # in-memory store (Map<id, Expense>), add/list
  validation.ts         # zod schemas + custom rule checks
  ledger.ts             # computeNetBalances(expenses) -> Record<user, number>
  settlement.ts         # minimizeDebts(balances) -> Settlement[]
  service.ts            # createExpense, listExpenses, getBalances (orchestration)
  money.ts              # round2, isNegligible (<0.01)
```

Validation rules (zod + manual):
- description: required, trim, 1–100 chars
- amount: number, finite, > 0
- paidBy: must be in USERS
- splits: array length === USERS.length, each person ∈ USERS, unique, percentage 0–100 number; sum === 100 (tolerance 0.01)

Business logic:
- Share = round2(amount * pct / 100)
- Net balance per user across all expenses: +paid, −owed_share (payer's own share cancels naturally)
- Debt minimization: greedy max-creditor vs max-debtor, transfer = min(|debtor|, creditor), round2, skip if <0.01, loop until settled
- Never emit self-edges or zero-amount settlements

Deliverable: pure TS modules + a tiny script/unit sanity check (e.g., the PRD's Dinner example) before any HTTP.

## Step 2 — Backend: REST APIs (TanStack server routes under `src/routes/api/`)

- `POST /api/expenses` → validate → repository.add → `{ success: true, message: "Expense added." }`; on validation failure → 400 `{ success:false, message }`
- `GET  /api/expenses` → array of expenses, newest first
- `GET  /api/balances` → `Settlement[]` from current expenses
- `GET  /api/users` (small helper for the frontend dropdown/sliders; keeps users hardcoded server-side)

Each route is a thin controller: parse body → call service → map errors → JSON. No logic in routes.

Manual verification via `stack_modern--invoke-server-function` for each endpoint (happy path + 3–4 validation failures + the PRD's Dinner scenario end-to-end).

## Step 3 — Frontend: API client + hooks

- `src/lib/api/splitwise.ts`: typed `fetch` wrappers for the 4 endpoints
- `src/hooks/useExpenses.ts`, `useBalances.ts`: TanStack Query hooks; invalidate both after a successful POST

## Step 4 — Frontend: components & page

Single page at `src/routes/index.tsx` composing:
- `ExpenseForm` (description, amount, Paid By select)
- `PercentageSliderList` with auto-balancing behavior exactly per FR-2:
  - 3 sliders init 34/33/33
  - On change of slider X to new value v (clamped 0–100): distribute the delta across the other users top-to-bottom (Amit → Rahul → Sneha priority), clamping at 0, never negative, sum stays exactly 100 (final rounding correction on the last adjusted slider)
- `ExpenseHistory` (newest first, card with description, amount, paidBy, split breakdown)
- `SettlementBoard` (human-readable lines; "X owes nobody" when a user has no outgoing debt)

Frontend validation mirrors PRD §12 (submit disabled until valid); server remains source of truth.

## Step 5 — Polish
- Desktop-first responsive layout using existing Tailwind/shadcn primitives
- Empty states, error toasts on 400s using server message
- Quick smoke test via Playwright: add the Dinner expense, assert history + settlement lines

---

## Technical notes
- In-memory repo lives at module scope of a server-only file; acceptable for MVP demo. Workers may cold-start and drop state — explicitly called out as PRD assumption ("no persistence").
- All money math via `round2` helper; comparisons use 0.01 epsilon.
- No edits/deletes, no auth, no DB, no multi-group — strictly excluded per PRD §2.

## Execution rule
One step at a time. I'll complete Step 1 (pure logic + validation), show you the modules and a sanity check, then wait for your go-ahead before Step 2.
