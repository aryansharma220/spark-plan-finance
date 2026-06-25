import type { NetBalances, Settlement } from "./types";
import { USERS, type User } from "./users";
import { round2, isNegligible } from "./money";

// PRD §14 Debt minimization: greedy match largest debtor with largest creditor.
export function minimizeDebts(balances: NetBalances): Settlement[] {
  // Work on a mutable copy
  const working: Array<{ user: User; amount: number }> = USERS.map((u) => ({
    user: u,
    amount: balances[u],
  }));

  const settlements: Settlement[] = [];
  let guard = 0;
  const maxIterations = USERS.length * USERS.length + 10;

  while (guard++ < maxIterations) {
    // Find max creditor (largest positive) and max debtor (largest negative)
    let creditorIdx = -1;
    let debtorIdx = -1;
    for (let i = 0; i < working.length; i++) {
      if (creditorIdx === -1 || working[i].amount > working[creditorIdx].amount) creditorIdx = i;
      if (debtorIdx === -1 || working[i].amount < working[debtorIdx].amount) debtorIdx = i;
    }
    if (creditorIdx === -1 || debtorIdx === -1) break;
    const creditor = working[creditorIdx];
    const debtor = working[debtorIdx];
    if (isNegligible(creditor.amount) || isNegligible(debtor.amount)) break;
    if (creditor.user === debtor.user) break;

    const transfer = round2(Math.min(creditor.amount, -debtor.amount));
    if (isNegligible(transfer)) break;

    settlements.push({ from: debtor.user, to: creditor.user, amount: transfer });
    creditor.amount = round2(creditor.amount - transfer);
    debtor.amount = round2(debtor.amount + transfer);
  }

  return settlements;
}
