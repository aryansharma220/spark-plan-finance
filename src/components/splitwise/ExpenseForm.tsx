import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, IndianRupee, Plus, ReceiptText, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PercentageSliderList, type SplitState } from "./PercentageSliderList";
import { useCreateExpense, useUsers } from "@/hooks/useSplitwise";
import type { User } from "@/lib/splitwise/types";

function initialSplits(users: User[]): SplitState {
  // Even split that sums to exactly 100 (e.g. 34/33/33 for 3 users)
  const base = Math.floor(100 / users.length);
  const remainder = 100 - base * users.length;
  return users.map((u, i) => ({
    person: u,
    percentage: base + (i < remainder ? 1 : 0),
  }));
}

export function ExpenseForm() {
  const { data: users } = useUsers();
  const createExpense = useCreateExpense();

  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [paidBy, setPaidBy] = useState<User | "">("");
  const [splits, setSplits] = useState<SplitState>(() => initialSplits(users));

  const amount = Number(amountStr);
  const amountValid = amountStr.trim() !== "" && Number.isFinite(amount) && amount > 0;
  const descValid = description.trim().length > 0 && description.trim().length <= 100;
  const totalPct = splits.reduce((a, s) => a + s.percentage, 0);
  const percentageSplitValid =
    splits.length === users.length &&
    splits.every(
      (split) =>
        Number.isInteger(split.percentage) && split.percentage >= 0 && split.percentage <= 100,
    ) &&
    totalPct === 100;
  const canSubmit =
    descValid && amountValid && paidBy !== "" && percentageSplitValid && !createExpense.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await createExpense.mutateAsync({
        description: description.trim(),
        amount,
        paidBy: paidBy as User,
        splits,
      });
      toast.success("Expense added.");
      setDescription("");
      setAmountStr("");
      setPaidBy("");
      setSplits(initialSplits(users));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <ReceiptText className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">Expense Details</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dinner"
            maxLength={100}
            className="bg-white"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="1200"
                className="bg-white pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidBy">Who paid?</Label>
            <Select value={paidBy} onValueChange={(v) => setPaidBy(v as User)}>
              <SelectTrigger id="paidBy" className="bg-white">
                <SelectValue placeholder="Select payer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Split Distribution</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums ${
              percentageSplitValid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {percentageSplitValid && <CheckCircle2 className="h-3.5 w-3.5" />}
            {totalPct}%
          </span>
        </div>
        <PercentageSliderList
          value={splits}
          amount={amountValid ? amount : 0}
          onChange={setSplits}
        />
      </div>
      <Button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full bg-blue-600 font-semibold shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:bg-slate-300"
      >
        {!createExpense.isPending && <Plus className="h-4 w-4" />}
        {createExpense.isPending ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
