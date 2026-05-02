import { useRef, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "~/lib/trpc";
import type { ChatDto } from "@repo/shared";

interface ChatItemProps {
  chat: ChatDto;
  isActive: boolean;
}

export function ChatItem({ chat, isActive }: ChatItemProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  // --- Pin toggle (optimistic) ---
  const togglePin = trpc.chat.togglePin.useMutation({
    onMutate: async ({ chatId }) => {
      await queryClient.cancelQueries({ queryKey: [["chat", "list"]] });
      const prev = queryClient.getQueriesData({ queryKey: [["chat", "list"]] });
      queryClient.setQueriesData(
        { queryKey: [["chat", "list"]] },
        (old: unknown) => {
          if (!old || typeof old !== "object" || !("pages" in old)) return old;
          const data = old as { pages: ChatDto[][] };
          return {
            ...data,
            pages: data.pages.map((page) =>
              page.map((c) =>
                c._id === chatId ? { ...c, isPinned: !c.isPinned } : c,
              ),
            ),
          };
        },
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, data]: [readonly unknown[], unknown]) =>
          queryClient.setQueryData(key as unknown[], data),
        );
      }
    },
    onSettled: () => {
      utils.chat.list.invalidate();
      utils.chat.search.invalidate();
    },
  });

  // --- Rename ---
  const rename = trpc.chat.rename.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      utils.chat.list.invalidate();
      utils.chat.search.invalidate();
    },
    onError: () => {
      setIsEditing(false);
      setEditTitle(chat.title);
    },
  });

  function commitRename() {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === chat.title) {
      setIsEditing(false);
      setEditTitle(chat.title);
      return;
    }
    rename.mutate({ chatId: chat._id, title: trimmed });
  }

  // --- Delete ---
  const deleteChat = trpc.chat.delete.useMutation({
    onSuccess: () => {
      if (isActive) {
        navigate({ to: "/chat", search: {} });
      }
      utils.chat.list.invalidate();
      utils.chat.search.invalidate();
    },
  });

  return (
    <div
      className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/8 hover:text-white"
      }`}
    >
      {/* Title / rename input */}
      <div
        className="min-w-0 flex-1 cursor-pointer truncate"
        onClick={() => {
          if (!isEditing) {
            navigate({ to: "/chat", search: (prev) => ({ ...prev, chatId: chat._id }) });
          }
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditTitle(chat.title);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{chat.title}</span>
        )}
      </div>

      {/* Actions (visible on hover or active) */}
      {!isEditing && (
        <div className={`flex shrink-0 items-center gap-0.5 transition-opacity group-hover:opacity-100 ${isConfirmingDelete ? "opacity-100" : "opacity-0"}`}>
          {/* Pin */}
          <button
            title={chat.isPinned ? "Unpin" : "Pin"}
            onClick={(e) => {
              e.stopPropagation();
              togglePin.mutate({ chatId: chat._id });
            }}
            className={`rounded p-0.5 hover:text-white ${chat.isPinned ? "text-white" : "text-white/40"}`}
          >
            📌
          </button>

          {/* Rename */}
          <button
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditTitle(chat.title);
            }}
            className="rounded p-0.5 text-white/40 hover:text-white"
          >
            ✏️
          </button>

          {/* Delete */}
          {isConfirmingDelete ? (
            <button
              title="Confirm delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteChat.mutate({ chatId: chat._id });
                setIsConfirmingDelete(false);
              }}
              className="rounded p-0.5 text-red-400 hover:text-red-300"
            >
              ✓
            </button>
          ) : (
            <button
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                setIsConfirmingDelete(true);
                setTimeout(() => setIsConfirmingDelete(false), 3000);
              }}
              className="rounded p-0.5 text-white/40 hover:text-red-400"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
}
