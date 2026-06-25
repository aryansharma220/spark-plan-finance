// Two-decimal currency precision per PRD §16
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// PRD §14: ignore values below 0.01
export const EPSILON = 0.01;
export function isNegligible(n: number): boolean {
  return Math.abs(n) < EPSILON;
}
