import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createExpense, deleteExpense, fetchBalances, fetchExpenses, fetchUsers, type CreateExpensePayload } from "@/lib/api/splitwise";

export const usersQueryOptions = queryOptions({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: Infinity,
});

export const expensesQueryOptions = queryOptions({
  queryKey: ["expenses"],
  queryFn: fetchExpenses,
});

export const balancesQueryOptions = queryOptions({
  queryKey: ["balances"],
  queryFn: fetchBalances,
});

export function useUsers() {
  return useSuspenseQuery(usersQueryOptions);
}

export function useExpenses() {
  return useSuspenseQuery(expensesQueryOptions);
}

export function useBalances() {
  return useSuspenseQuery(balancesQueryOptions);
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}
