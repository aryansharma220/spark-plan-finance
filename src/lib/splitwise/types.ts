import type { User } from "./users";

export interface Split {
  person: User;
  percentage: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: User;
  splits: Split[];
  createdAt: string; // ISO
}

export interface Settlement {
  from: User;
  to: User;
  amount: number;
}

export type NetBalances = Record<User, number>;
