import { createExpenseSchema, firstErrorMessage } from "./validation";
import { expenseRepository } from "./repository.server";
import { computeNetBalances } from "./ledger";
import { minimizeDebts } from "./settlement";
import type { Expense, Settlement } from "./types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function genId(): string {
  // Worker-safe id
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function createExpense(rawInput: unknown): Expense {
  const parsed = createExpenseSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ValidationError(firstErrorMessage(parsed.error));
  }
  const data = parsed.data;
  const expense: Expense = {
    id: genId(),
    description: data.description,
    amount: data.amount,
    paidBy: data.paidBy,
    splits: data.splits,
    createdAt: new Date().toISOString(),
  };
  expenseRepository.add(expense);
  return expense;
}

export function listExpenses(): Expense[] {
  return expenseRepository.listNewestFirst();
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export function deleteExpense(id: string): void {
  if (!id || typeof id !== "string") {
    throw new ValidationError("Expense id is required.");
  }
  const removed = expenseRepository.remove(id);
  if (!removed) {
    throw new NotFoundError("Expense not found.");
  }
}

export function getSettlements(): Settlement[] {
  const balances = computeNetBalances(expenseRepository.list());
  return minimizeDebts(balances);
}
