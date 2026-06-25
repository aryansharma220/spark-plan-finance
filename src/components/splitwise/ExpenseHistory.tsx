import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDeleteExpense, useExpenses } from "@/hooks/useSplitwise";

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function ExpenseHistory() {
  const { data: expenses } = useExpenses();
  const deleteMutation = useDeleteExpense();

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No expenses yet. Add one to get started.
      </p>
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
    <div className="space-y-3">
      {expenses.map((exp) => {
        const isDeleting =
          deleteMutation.isPending && deleteMutation.variables === exp.id;
        return (
          <Card key={exp.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{exp.description}</p>
                  <p className="text-xs text-muted-foreground">Paid by {exp.paidBy}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold tabular-nums">
                    {formatINR(exp.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${exp.description}`}
                    disabled={isDeleting}
                    onClick={() => handleDelete(exp.id, exp.description)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {exp.splits.map((s) => (
                  <span
                    key={s.person}
                    className="rounded-md bg-secondary px-2 py-1 text-xs"
                  >
                    {s.person} {s.percentage}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
