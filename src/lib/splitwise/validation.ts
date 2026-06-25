import { z } from "zod";
import { USERS } from "./users";

const userEnum = z.enum(USERS);

const splitSchema = z.object({
  person: userEnum,
  percentage: z
    .number({ message: "Percentage must be a number." })
    .finite("Percentage must be a finite number.")
    .min(0, "Percentage must be between 0 and 100.")
    .max(100, "Percentage must be between 0 and 100."),
});

export const createExpenseSchema = z
  .object({
    description: z
      .string({ message: "Description is required." })
      .transform((s) => s.trim())
      .pipe(
        z
          .string()
          .min(1, "Description is required.")
          .max(100, "Description must be at most 100 characters."),
      ),
    amount: z
      .number({ message: "Amount must be a number." })
      .finite("Amount must be a finite number.")
      .positive("Amount must be positive."),
    paidBy: userEnum,
    splits: z.array(splitSchema).length(USERS.length, "Splits must include every user."),
  })
  .superRefine((val, ctx) => {
    // unique persons covering exactly the full user set
    const persons = val.splits.map((s) => s.person);
    const unique = new Set(persons);
    if (unique.size !== persons.length) {
      ctx.addIssue({
        code: "custom",
        path: ["splits"],
        message: "Each user can appear at most once in splits.",
      });
      return;
    }
    for (const u of USERS) {
      if (!unique.has(u)) {
        ctx.addIssue({ code: "custom", path: ["splits"], message: `Split for ${u} is missing.` });
        return;
      }
    }
    const total = val.splits.reduce((acc, s) => acc + s.percentage, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        path: ["splits"],
        message: "Total percentage must equal 100.",
      });
    }
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request.";
}
