import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { getServerSession } from "~/lib/auth.server";
import { Sidebar } from "~/components/sidebar/Sidebar";
import { Conversation } from "~/components/conversation/Conversation";

const searchSchema = z.object({
  chatId: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/chat")({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await getServerSession();
    if (!session?.session) {
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
