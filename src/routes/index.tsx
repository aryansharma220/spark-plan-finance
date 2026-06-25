import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/splitwise/ExpenseForm";
import { ExpenseHistory } from "@/components/splitwise/ExpenseHistory";
import { SettlementBoard } from "@/components/splitwise/SettlementBoard";
import {
  balancesQueryOptions,
  expensesQueryOptions,
  usersQueryOptions,
} from "@/hooks/useSplitwise";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Splitwise Lite" },
      { name: "description", content: "Track shared expenses and settle up with the minimum number of transactions." },
      { property: "og:title", content: "Splitwise Lite" },
      { property: "og:description", content: "Track shared expenses and settle up with the minimum number of transactions." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(usersQueryOptions);
    context.queryClient.ensureQueryData(expensesQueryOptions);
    context.queryClient.ensureQueryData(balancesQueryOptions);
  },
  errorComponent: ({ error }) => (
    <div className="p-8 text-destructive" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
  component: Index,
});

function Loading() {
  return <p className="text-sm text-muted-foreground">Loading…</p>;
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">Splitwise Lite</h1>
          <p className="text-sm text-muted-foreground">
            Amit · Rahul · Sneha
          </p>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loading />}>
              <ExpenseForm />
            </Suspense>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Board</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <SettlementBoard />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <ExpenseHistory />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
