import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Input } from "@heroui/react";

export function SearchInput() {
  const { q } = useSearch({ from: "/chat" });
  const navigate = useNavigate();
  const [value, setValue] = useState(q ?? "");

  useEffect(() => {
    setValue(q ?? "");
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({
        to: "/chat",
        search: (prev) => ({ ...prev, q: value.trim() || undefined }),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [value, navigate]);

  return (
    <Input
      type="search"
      placeholder="Search chats..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full"
    />
  );
}
