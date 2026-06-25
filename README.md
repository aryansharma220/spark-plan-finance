# Splitwise Lite Expense Tracker

A lightweight group expense ledger for tracking shared bills between Amit, Rahul, and Sneha. Users can add an expense, choose who paid, split the bill with percentage sliders, and immediately see a minimized settlement plan showing who owes whom.

This project was built for the Splitwise-Lite Expense Tracker problem statement. The final "vibe check" requirement replaces equal-split checkboxes with custom percentage sliders, so the application uses percentage-based proportional splitting instead of checkbox-based equal splitting.

## Problem Statement

The task is to build a collaborative expense ledger utility where a fixed group can enter shared dinner or vacation bills and instantly see a calculated, minimized list of debts.

The required user flow is:

1. Enter an item description.
2. Enter the total bill amount.
3. Select the payer from Amit, Rahul, and Sneha.
4. Allocate the split using percentage sliders.
5. Submit only when all sliders collectively total exactly 100%.
6. View a live settlement board that keeps the output simple by minimizing debts.

The backend must split the bill proportionally based on the custom sliders and consolidate overlapping debts into the smallest practical set of settlement transactions.

## Our Solution

The application provides a single-page dashboard with three main areas:

- **Add Expense**: form for description, amount, payer, and percentage split.
- **Settlement Board**: live optimized settlement cards showing who pays whom.
- **Expense History**: scrollable list of submitted expenses with payer and split breakdown.

The frontend handles user interaction and presentation, including slider balancing and submit-button gating. The authoritative validation, expense creation, ledger calculation, and settlement minimization are handled on the server side.

## Key Features

- Fixed group: Amit, Rahul, Sneha.
- Percentage sliders for custom proportional splitting.
- Slider total must equal exactly 100% before submission.
- Live calculated split preview beside each slider.
- Server-side validation for submitted expenses.
- Server-side ledger generation.
- Debt minimization to simplify settlements.
- Scrollable expense history, newest first.
- In-memory storage for the current server session.
- Responsive SaaS-style dashboard UI.

## Tech Stack

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS
- Radix UI primitives
- lucide-react icons
- Zod for request validation

## Architecture

```text
Browser UI
  |
  | React components + TanStack Query
  v
API client
  |
  | fetch()
  v
TanStack Start server routes
  |
  v
Splitwise service layer
  |
  +--> Validation
  +--> Expense creation
  +--> Ledger generation
  +--> Debt minimization
  |
  v
In-memory repository
```

### Frontend Layer

The main UI lives in:

```text
src/routes/index.tsx
src/components/splitwise/ExpenseForm.tsx
src/components/splitwise/PercentageSliderList.tsx
src/components/splitwise/SettlementBoard.tsx
src/components/splitwise/ExpenseHistory.tsx
```

Responsibilities:

- Render the dashboard.
- Collect expense input.
- Keep slider values interactive and user-friendly.
- Disable submission until required fields are valid and split total is exactly 100%.
- Fetch expenses and settlements through API hooks.
- Present settlements and history in a readable format.

### API Layer

API routes are implemented with TanStack Start file routes:

```text
src/routes/api/users.ts
src/routes/api/expenses.ts
src/routes/api/expenses.$id.ts
src/routes/api/balances.ts
```

Available endpoints:

| Method | Endpoint            | Purpose                                        |
| ------ | ------------------- | ---------------------------------------------- |
| GET    | `/api/users`        | Returns the fixed group users.                 |
| GET    | `/api/expenses`     | Returns submitted expenses, newest first.      |
| POST   | `/api/expenses`     | Creates a validated expense.                   |
| DELETE | `/api/expenses/:id` | Removes an expense from the in-memory session. |
| GET    | `/api/balances`     | Returns minimized settlement transactions.     |

### Business Logic Layer

Core expense logic is isolated under:

```text
src/lib/splitwise/
```

Important files:

| File                   | Responsibility                                        |
| ---------------------- | ----------------------------------------------------- |
| `users.ts`             | Defines the fixed group: Amit, Rahul, Sneha.          |
| `types.ts`             | Shared Expense, Split, Settlement, and balance types. |
| `validation.ts`        | Validates incoming expense payloads with Zod.         |
| `service.server.ts`    | Creates expenses and exposes settlement operations.   |
| `repository.server.ts` | Stores expenses in memory.                            |
| `ledger.ts`            | Converts expenses into net balances.                  |
| `settlement.ts`        | Minimizes debts into settlement transactions.         |
| `money.ts`             | Handles two-decimal rounding and negligible values.   |
| `presentation.ts`      | Shared UI formatting and participant accent styles.   |

## Calculation Model

Each expense has:

```ts
{
  id: string;
  description: string;
  amount: number;
  paidBy: "Amit" | "Rahul" | "Sneha";
  splits: {
    person: "Amit" | "Rahul" | "Sneha";
    percentage: number;
  }
  [];
  createdAt: string;
}
```

For every expense:

1. The payer receives credit for the full amount.
2. Each participant is debited by their proportional share.
3. Share is calculated as:

```text
share = amount * percentage / 100
```

Example:

```text
Amount: 1200
Paid by: Rahul

Amit: 40%  -> 480
Rahul: 20% -> 240
Sneha: 40% -> 480
```

The net balance indicates whether a user should receive money or pay money:

- Positive balance: user should receive money.
- Negative balance: user should pay money.

## Debt Minimization

The settlement engine:

1. Computes net balances for all users.
2. Separates creditors from debtors.
3. Repeatedly matches the largest debtor with the largest creditor.
4. Transfers the smaller of the debtor amount and creditor amount.
5. Stops when remaining balances are settled or negligible.

This keeps the settlement board concise. For example, overlapping debts are netted into a simpler final transaction instead of showing every individual expense-level debt.

## Validation Rules

The frontend prevents submission unless:

- Description is present.
- Amount is present and positive.
- A payer is selected.
- Split percentages are integers from 0 to 100.
- Split percentages total exactly 100%.

The backend validates the submitted payload again before creating the expense:

- Description is required, trimmed, and capped at 100 characters.
- Amount must be numeric, finite, and positive.
- Payer must be one of Amit, Rahul, or Sneha.
- Splits must include every user exactly once.
- Each percentage must be between 0 and 100.
- Total percentage must equal exactly 100.

Invalid requests return a JSON error response with a meaningful message.

## In-Memory State

Expenses are stored in memory on the server:

```text
src/lib/splitwise/repository.server.ts
```

This means data persists while the server process is running, but resets when the server restarts. No database is configured in this implementation.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Vite will print the local URL in the terminal. By default, it is usually:

```text
http://localhost:5173/
```

### Build for production

```bash
npm run build
```

### Run lint checks

```bash
npm run lint
```

## Available Scripts

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Starts the Vite development server. |
| `npm run build`     | Builds the app for production.      |
| `npm run build:dev` | Builds in development mode.         |
| `npm run preview`   | Serves a production preview.        |
| `npm run lint`      | Runs ESLint.                        |
| `npm run format`    | Formats files with Prettier.        |

## Project Structure

```text
src/
  components/
    splitwise/          # Feature-specific UI components
    ui/                 # Reusable UI primitives
  hooks/
    useSplitwise.ts     # Query and mutation hooks
  lib/
    api/
      splitwise.ts      # Browser/server API client helpers
    splitwise/          # Business logic and server-side domain code
  routes/
    api/                # TanStack Start API routes
    index.tsx           # Main dashboard route
  router.tsx
  server.ts
  start.ts
  styles.css
```

## Notes for Reviewers

- The application follows the updated problem requirement by using percentage sliders instead of equal-split checkboxes.
- The frontend enforces the exact 100% slider total before enabling submission.
- The backend also validates the exact 100% total and performs proportional split calculations.
- Settlement results are generated dynamically from the current expense list.
- The implementation uses in-memory storage and does not include authentication or a database.
- No video demo is included.
