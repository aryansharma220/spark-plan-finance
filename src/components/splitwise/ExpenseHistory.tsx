import { ReceiptText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatINR, getParticipantAccent } from "@/lib/splitwise/presentation";
import { useDeleteExpense, useExpenses } from "@/hooks/useSplitwise";

export function ExpenseHistory() {
  const { data: expenses } = useExpenses();
  const deleteMutation = useDeleteExpense();

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ReceiptText className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900">No expenses added.</p>
        <p className="mt-1 text-sm text-slate-500">Your newest bills will appear here.</p>
      </div>
    );
  }

  const handleDelete = (id: string, description: string) => {
    if (!confirm(`Delete "${description}"? This will update the settlement board.`)) {
      return;
    }
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Expense deleted."),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete expense."),
    });
  };

  return (
    <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
      {expenses.map((exp) => {
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === exp.id;
        return (
          <Card
            key={exp.id}
            className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ReceiptText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{exp.description}</p>
                    <p className="text-xs text-slate-500">Paid by {exp.paidBy}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  <p className="pt-1 text-lg font-semibold tabular-nums text-slate-950">
                    {formatINR(exp.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${exp.description}`}
                    disabled={isDeleting}
                    onClick={() => handleDelete(exp.id, exp.description)}
                    className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {exp.splits.map((s) => {
                  const accent = getParticipantAccent(s.person);
                  return (
                    <span
                      key={s.person}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                        accent.chip,
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", accent.dot)} />
                      {s.person} {s.percentage}%
                    </span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
