import { useBalances, useUsers } from "@/hooks/useSplitwise";
import { ArrowRight, CheckCircle2, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR, getParticipantAccent } from "@/lib/splitwise/presentation";
import type { User } from "@/lib/splitwise/types";

export function SettlementBoard() {
  const { data: settlements } = useBalances();
  const { data: users } = useUsers();

  const debtors = new Set<User>(settlements.map((s) => s.from));

  return (
    <div className="space-y-3">
      {settlements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Scale className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-900">No settlements yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first expense to see who owes whom.
          </p>
        </div>
      ) : (
        settlements.map((s, i) => {
          const fromAccent = getParticipantAccent(s.from);
          const toAccent = getParticipantAccent(s.to);

          return (
            <div
              key={`${s.from}-${s.to}-${i}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className={cn("rounded-lg border px-3 py-2", fromAccent.panel)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", fromAccent.dot)} />
                    <span className="text-sm font-semibold text-slate-900">{s.from}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">pays</p>
                </div>
                <div className="flex flex-col items-center gap-1 text-blue-600">
                  <ArrowRight className="h-5 w-5" />
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-blue-700">
                    {formatINR(s.amount)}
                  </span>
                </div>
                <div className={cn("rounded-lg border px-3 py-2 text-right", toAccent.panel)}>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-semibold text-slate-900">{s.to}</span>
                    <span className={cn("h-2.5 w-2.5 rounded-full", toAccent.dot)} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">receives</p>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {users
          .filter((u) => !debtors.has(u))
          .map((u) => {
            const accent = getParticipantAccent(u);
            return (
              <span
                key={u}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                  accent.chip,
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {u} is settled
              </span>
            );
          })}
      </div>
    </div>
  );
}
