// Fixed group per PRD §3
export const USERS = ["Amit", "Rahul", "Sneha"] as const;
export type User = (typeof USERS)[number];

export function isUser(value: unknown): value is User {
  return typeof value === "string" && (USERS as readonly string[]).includes(value);
}
