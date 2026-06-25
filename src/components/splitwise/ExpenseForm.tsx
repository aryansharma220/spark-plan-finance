import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const canSubmit =
    descValid && amountValid && paidBy !== "" && totalPct === 100 && !createExpense.isPending;

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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner"
          maxLength={100}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="1200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidBy">Paid By</Label>
          <Select value={paidBy} onValueChange={(v) => setPaidBy(v as User)}>
            <SelectTrigger id="paidBy">
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Percentage Split</Label>
          <span
            className={`text-xs tabular-nums ${
              totalPct === 100 ? "text-muted-foreground" : "text-destructive"
            }`}
          >
            Total: {totalPct}%
          </span>
        </div>
        <PercentageSliderList value={splits} onChange={setSplits} />
      </div>
      <Button type="submit" disabled={!canSubmit} className="w-full">
        {createExpense.isPending ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
