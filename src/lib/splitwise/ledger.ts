import type { Expense, NetBalances } from "./types";
import { USERS, type User } from "./users";
import { round2 } from "./money";

// PRD §14: net balance per user. Positive => should receive. Negative => should pay.
// Each expense: payer gets +amount, each participant (including payer) gets -share.
// Payer's own share cancels naturally inside their net.
export function computeNetBalances(expenses: Expense[]): NetBalances {
  const balances: Record<string, number> = {};
  for (const u of USERS) balances[u] = 0;

  for (const exp of expenses) {
    balances[exp.paidBy] += exp.amount;
    for (const split of exp.splits) {
      const share = (exp.amount * split.percentage) / 100;
      balances[split.person] -= share;
    }
  }

  // Round once for stable comparisons downstream
  for (const u of USERS) balances[u] = round2(balances[u]);
  return balances as NetBalances;
}

export function getUserNet(balances: NetBalances, user: User): number {
  return balances[user];
}
