import { createFileRoute } from "@tanstack/react-router";
import { deleteExpense, NotFoundError, ValidationError } from "@/lib/splitwise/service.server";

export const Route = createFileRoute("/api/expenses/$id")({
  server: {
    handlers: {
      DELETE: async ({ params }) => {
        try {
          deleteExpense(params.id);
          return Response.json({ success: true, message: "Expense deleted." });
        } catch (err) {
          if (err instanceof ValidationError) {
            return Response.json({ success: false, message: err.message }, { status: 400 });
          }
          if (err instanceof NotFoundError) {
            return Response.json({ success: false, message: err.message }, { status: 404 });
          }
          console.error("DELETE /api/expenses/:id failed:", err);
          return Response.json(
            { success: false, message: "Internal server error." },
            { status: 500 },
          );
        }
      },
    },
  },
});
