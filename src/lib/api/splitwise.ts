import type { Expense, Settlement, User } from "@/lib/splitwise/types";
import { createIsomorphicFn } from "@tanstack/start-fn-stubs";
import { getStartContext } from "@tanstack/start-storage-context";

export type CreateExpensePayload = {
  description: string;
  amount: number;
  paidBy: User;
  splits: { person: User; percentage: number }[];
};

export type ApiSuccess = { success: true; message: string };
export type ApiError = { success: false; message: string };

const getApiBaseUrl = createIsomorphicFn()
  .client(() => window.location.origin)
  .server(() => new URL(getStartContext().request.url).origin);

function apiUrl(path: string): string {
  return new URL(path, getApiBaseUrl()).toString();
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response (status ${res.status}).`);
  }
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(apiUrl("/api/users"));
  if (!res.ok) throw new Error("Failed to load users.");
  return parseJson<User[]>(res);
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(apiUrl("/api/expenses"));
  if (!res.ok) throw new Error("Failed to load expenses.");
  return parseJson<Expense[]>(res);
}

export async function fetchBalances(): Promise<Settlement[]> {
  const res = await fetch(apiUrl("/api/balances"));
  if (!res.ok) throw new Error("Failed to load balances.");
  return parseJson<Settlement[]>(res);
}

export async function createExpense(payload: CreateExpensePayload): Promise<ApiSuccess> {
  const res = await fetch(apiUrl("/api/expenses"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<ApiSuccess | ApiError>(res);
  if (!res.ok || !data.success) {
    throw new Error((data as ApiError).message || "Failed to create expense.");
  }
  return data;
}

export async function deleteExpense(id: string): Promise<ApiSuccess> {
  const res = await fetch(apiUrl(`/api/expenses/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
  const data = await parseJson<ApiSuccess | ApiError>(res);
  if (!res.ok || !data.success) {
    throw new Error((data as ApiError).message || "Failed to delete expense.");
  }
  return data;
}
