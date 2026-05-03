import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { authClient } from "./auth-client";

export const getServerSession = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const request = getRequest();
      const cookieHeader = request?.headers.get("cookie") ?? "";
      const { data } = await authClient.getSession({
        fetchOptions: { headers: { cookie: cookieHeader } },
      });
      return data;
    } catch {
      return null;
    }
  },
);
