import { createFileRoute } from "@tanstack/react-router";
import { USERS } from "@/lib/splitwise/users";

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => Response.json(USERS),
    },
  },
});
