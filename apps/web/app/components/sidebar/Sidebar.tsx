import { useNavigate } from "@tanstack/react-router";
import { Button, Spinner } from "@heroui/react";
import { trpc } from "~/lib/trpc";
import { SearchInput } from "./SearchInput";
import { ChatList } from "./ChatList";

export function Sidebar() {
  const navigate = useNavigate();

  const createChat = trpc.chat.create.useMutation({
    onSuccess: (chat) => {
      navigate({ to: "/chat", search: { chatId: chat._id } });
    },
  });

  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-white/5">
      <div className="p-3">
        <Button
          fullWidth
          variant="outline"
          isDisabled={createChat.isPending}
          onClick={() => createChat.mutate({ title: "New Chat" })}
        >
          {createChat.isPending ? <Spinner size="sm" /> : "+ New Chat"}
        </Button>
      </div>
      <div className="px-3 pb-2">
        <SearchInput />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
    </div>
  );
}
