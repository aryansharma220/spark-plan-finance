import { useBalances, useUsers } from "@/hooks/useSplitwise";
import type { User } from "@/lib/splitwise/types";

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function SettlementBoard() {
  const { data: settlements } = useBalances();
  const { data: users } = useUsers();

  const debtors = new Set<User>(settlements.map((s) => s.from));

  return (
    <div className="space-y-2">
      {settlements.length === 0 ? (
        <p className="text-sm text-muted-foreground">All settled. Nobody owes anyone.</p>
      ) : (
        settlements.map((s, i) => (
          <div
            key={`${s.from}-${s.to}-${i}`}
            className="rounded-md border border-border bg-card p-3 text-sm"
          >
            <span className="font-medium">{s.from}</span> owes{" "}
            <span className="font-medium">{s.to}</span>{" "}
            <span className="font-semibold tabular-nums">{formatINR(s.amount)}</span>
          </div>
        ))
      )}
      <div className="pt-2 text-xs text-muted-foreground">
        {users
          .filter((u) => !debtors.has(u))
          .map((u) => `${u} owes nobody`)
          .join(" · ")}
      </div>
    </div>
  );
}
