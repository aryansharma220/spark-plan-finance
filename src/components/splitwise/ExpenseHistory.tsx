import { Card, CardContent } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useSplitwise";

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function ExpenseHistory() {
  const { data: expenses } = useExpenses();

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No expenses yet. Add one to get started.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp) => (
        <Card key={exp.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{exp.description}</p>
                <p className="text-xs text-muted-foreground">Paid by {exp.paidBy}</p>
              </div>
              <p className="text-lg font-semibold tabular-nums">
                {formatINR(exp.amount)}
              </p>
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
      ))}
    </div>
  );
}
