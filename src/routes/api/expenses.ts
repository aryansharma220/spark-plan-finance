import { createFileRoute } from "@tanstack/react-router";
import { createExpense, listExpenses, ValidationError } from "@/lib/splitwise/service.server";

export const Route = createFileRoute("/api/expenses")({
  server: {
    handlers: {
      GET: async () => Response.json(listExpenses()),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
        }
        try {
          createExpense(body);
          return Response.json({ success: true, message: "Expense added." });
        } catch (err) {
          if (err instanceof ValidationError) {
            return Response.json({ success: false, message: err.message }, { status: 400 });
          }
          console.error("POST /api/expenses failed:", err);
          return Response.json(
            { success: false, message: "Internal server error." },
            { status: 500 },
          );
        }
      },
    },
  },
});
