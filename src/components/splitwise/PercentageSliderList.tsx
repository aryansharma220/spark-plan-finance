import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { User } from "@/lib/splitwise/types";

export type SplitState = { person: User; percentage: number }[];

function distributeByWeight(total: number, capacities: number[]): number[] {
  const allocations = capacities.map(() => 0);
  const capacityTotal = capacities.reduce((sum, capacity) => sum + capacity, 0);
  const target = Math.min(total, capacityTotal);

  if (target <= 0 || capacityTotal <= 0) return allocations;

  let assigned = 0;
  for (let i = 0; i < capacities.length; i++) {
    const share = Math.floor((target * capacities[i]) / capacityTotal);
    allocations[i] = Math.min(capacities[i], share);
    assigned += allocations[i];
  }

  // Top-to-bottom priority for integer rounding leftovers.
  let remaining = target - assigned;
  while (remaining > 0) {
    let changed = false;
    for (let i = 0; i < allocations.length && remaining > 0; i++) {
      if (allocations[i] < capacities[i]) {
        allocations[i] += 1;
        remaining -= 1;
        changed = true;
      }
    }
    if (!changed) break;
  }

  return allocations;
}

/**
 * Auto-balance per PRD FR-2: when one slider changes, spread the delta across
 * the other sliders proportionally, using top-to-bottom priority for rounding.
 * Each slider is clamped to [0, 100], total is always exactly 100.
 */
export function rebalance(current: SplitState, idx: number, next: number): SplitState {
  const result = current.map((s) => ({ ...s }));
  const clampedNext = Math.max(0, Math.min(100, Math.round(next)));
  const oldVal = result[idx].percentage;
  const delta = clampedNext - oldVal;
  result[idx].percentage = clampedNext;

  const others = result.map((_, i) => i).filter((i) => i !== idx);

  if (delta > 0) {
    const removals = distributeByWeight(
      delta,
      others.map((i) => result[i].percentage),
    );
    const absorbed = removals.reduce((sum, removal) => sum + removal, 0);
    others.forEach((j, i) => {
      result[j].percentage -= removals[i];
    });
    if (absorbed < delta) result[idx].percentage -= delta - absorbed;
  } else if (delta < 0) {
    const additions = distributeByWeight(
      -delta,
      others.map((i) => 100 - result[i].percentage),
    );
    const absorbed = additions.reduce((sum, addition) => sum + addition, 0);
    others.forEach((j, i) => {
      result[j].percentage += additions[i];
    });
    if (absorbed < -delta) result[idx].percentage += -delta - absorbed;
  }

  // Final integer-sum correction (rounding safety)
  const sum = result.reduce((a, s) => a + s.percentage, 0);
  if (sum !== 100) {
    // adjust the last "other" slider to make total exactly 100
    const adjustIdx = others[others.length - 1];
    result[adjustIdx].percentage = Math.max(
      0,
      Math.min(100, result[adjustIdx].percentage + (100 - sum)),
    );
  }
  return result;
}

interface Props {
  value: SplitState;
  onChange: (next: SplitState) => void;
}

export function PercentageSliderList({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      {value.map((split, idx) => (
        <div key={split.person} className="grid grid-cols-[80px_1fr_72px] items-center gap-4">
          <span className="text-sm font-medium">{split.person}</span>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[split.percentage]}
            onValueChange={([v]) => onChange(rebalance(value, idx, v ?? 0))}
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={100}
              step={1}
              value={split.percentage}
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (!Number.isNaN(raw)) {
                  onChange(rebalance(value, idx, raw));
                }
              }}
              className="h-8 w-12 px-1 text-center text-sm tabular-nums"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
