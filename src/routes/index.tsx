import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ReceiptText, Scale, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      {
        name: "description",
        content: "Track shared expenses and settle up with the minimum number of transactions.",
      },
      { property: "og:title", content: "Splitwise Lite" },
      {
        property: "og:description",
        content: "Track shared expenses and settle up with the minimum number of transactions.",
      },
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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
              <ReceiptText className="h-4 w-4" />
              Collaborative Expense Tracker
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Splitwise Lite</h1>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-500" />
            Amit <span className="text-slate-300">|</span> Rahul{" "}
            <span className="text-slate-300">|</span> Sneha
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl items-start gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ReceiptText className="h-5 w-5 text-blue-600" />
              Add Expense
            </CardTitle>
            <CardDescription>Record a shared bill and split it by percentage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Loading />}>
              <ExpenseForm />
            </Suspense>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Scale className="h-5 w-5 text-emerald-600" />
                Settlement Board
              </CardTitle>
              <CardDescription>Optimized transactions to settle everyone up.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <SettlementBoard />
              </Suspense>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ReceiptText className="h-5 w-5 text-amber-600" />
                Expense History
              </CardTitle>
              <CardDescription>Newest expenses appear first.</CardDescription>
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
