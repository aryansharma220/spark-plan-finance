import { createFileRoute } from "@tanstack/react-router";
import { getSettlements } from "@/lib/splitwise/service.server";

export const Route = createFileRoute("/api/balances")({
  server: {
    handlers: {
      GET: async () => Response.json(getSettlements()),
    },
  },
});
