import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "~/lib/auth-client";
import { Sidebar } from "~/components/sidebar/Sidebar";
import { Conversation } from "~/components/conversation/Conversation";

const searchSchema = z.object({
  chatId: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/chat")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    // Session cookie lives on the API domain (Railway), not on the frontend
    // domain (Vercel). Server-side code can't access it. Check client-side
    // instead: authClient.getSession() sends the cookie directly to Railway.
    if (typeof document === "undefined") return;
    const { data } = await authClient.getSession();
    if (!data?.session) {
      throw redirect({ to: "/auth" as any });
    }
  },
  component: ChatPage,
});

function ChatPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <Conversation />
    </div>
  );
}
