import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { User } from "@/lib/splitwise/types";

export type SplitState = { person: User; percentage: number }[];

/**
 * Auto-balance per PRD FR-2: when slider at index `idx` changes to `next`,
 * absorb the delta across the OTHER sliders top-to-bottom (by users array order).
 * Each slider clamped to [0, 100], total always exactly 100, never negative.
 */
export function rebalance(current: SplitState, idx: number, next: number): SplitState {
  const result = current.map((s) => ({ ...s }));
  const clampedNext = Math.max(0, Math.min(100, Math.round(next)));
  const oldVal = result[idx].percentage;
  let delta = clampedNext - oldVal;
  result[idx].percentage = clampedNext;

  const others = result.map((_, i) => i).filter((i) => i !== idx);

  if (delta > 0) {
    // others must lose `delta` total, top-to-bottom
    for (const j of others) {
      if (delta <= 0) break;
      const take = Math.min(delta, result[j].percentage);
      result[j].percentage -= take;
      delta -= take;
    }
    // if not all absorbed (others all 0), clamp changed slider
    if (delta > 0) result[idx].percentage -= delta;
  } else if (delta < 0) {
    let give = -delta;
    for (const j of others) {
      if (give <= 0) break;
      const room = 100 - result[j].percentage;
      const add = Math.min(give, room);
      result[j].percentage += add;
      give -= add;
    }
    if (give > 0) result[idx].percentage += give;
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
