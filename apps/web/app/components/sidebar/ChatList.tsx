import { useEffect, useRef, useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
import { trpc } from "~/lib/trpc";
import type { ChatDto } from "@repo/shared";
import { ChatItem } from "./ChatItem";

const PAGE_SIZE = 20;

function sortChats(chats: ChatDto[]): ChatDto[] {
  return [...chats].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function ChatList() {
  const { q, chatId } = useSearch({ from: "/chat" });
  const sentinelRef = useRef<HTMLDivElement>(null);

  const listQuery = trpc.chat.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      enabled: !q,
      getNextPageParam: (lastPage) => {
        if (lastPage.length < PAGE_SIZE) return undefined;
        return lastPage[lastPage.length - 1]?._id;
      },
      initialCursor: undefined,
    },
  );

  const searchQuery = trpc.chat.search.useQuery(
    { query: q ?? "" },
    { enabled: !!q },
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || q) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          listQuery.hasNextPage &&
          !listQuery.isFetchingNextPage
        ) {
          listQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [q, listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.fetchNextPage]);

  const chats = useMemo<ChatDto[]>(() => {
    if (q) return (searchQuery.data as ChatDto[] | undefined) ?? [];
    const flat = (listQuery.data?.pages.flat() ?? []) as ChatDto[];
    return sortChats(flat);
  }, [q, searchQuery.data, listQuery.data]);

  const isLoading = q ? searchQuery.isLoading : listQuery.isLoading;
  const isError = q ? searchQuery.isError : listQuery.isError;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-white/40">Loading...</div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-sm text-red-400">
        Failed to load chats.
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-white/40">
        {q ? "No chats match your search." : "No chats yet. Create one!"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-1">
      {chats.map((chat) => (
        <ChatItem key={chat._id} chat={chat} isActive={chat._id === chatId} />
      ))}
      {!q && <div ref={sentinelRef} className="h-1" />}
      {listQuery.isFetchingNextPage && (
        <div className="py-2 text-center text-xs text-white/40">
          Loading more...
        </div>
      )}
    </div>
  );
}
