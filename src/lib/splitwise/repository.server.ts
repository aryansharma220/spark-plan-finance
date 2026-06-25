import type { Expense } from "./types";

// In-memory store per PRD §16 (no persistence). Server-only.
const store: Expense[] = [];

export const expenseRepository = {
  add(expense: Expense): Expense {
    store.push(expense);
    return expense;
  },
  list(): Expense[] {
    // Return a copy to prevent mutation
    return store.slice();
  },
  listNewestFirst(): Expense[] {
    return store.slice().reverse();
  },
  remove(id: string): boolean {
    const idx = store.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    store.splice(idx, 1);
    return true;
  },
  clear(): void {
    store.length = 0;
  },
};
