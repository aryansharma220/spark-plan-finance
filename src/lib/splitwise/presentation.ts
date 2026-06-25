import type { User } from "./users";

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

const participantAccents: Record<
  User,
  {
    dot: string;
    chip: string;
    panel: string;
    text: string;
  }
> = {
  Amit: {
    dot: "bg-blue-500",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    panel: "border-blue-100 bg-blue-50/70",
    text: "text-blue-700",
  },
  Rahul: {
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    panel: "border-emerald-100 bg-emerald-50/70",
    text: "text-emerald-700",
  },
  Sneha: {
    dot: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    panel: "border-amber-100 bg-amber-50/70",
    text: "text-amber-700",
  },
};

export function getParticipantAccent(user: User) {
  return participantAccents[user];
}
