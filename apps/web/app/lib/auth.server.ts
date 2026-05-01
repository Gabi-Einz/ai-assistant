import { createServerFn } from "@tanstack/start-client-core";
import { getWebRequest } from "@tanstack/start/server";
import { authClient } from "./auth-client";

export const getServerSession = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const request = getWebRequest();
      const cookieHeader = request?.headers.get("cookie") ?? "";
      console.log("[GSS] cookieHeader:", cookieHeader);
      const { data } = await authClient.getSession({
        fetchOptions: { headers: { cookie: cookieHeader } },
      });
      console.log("[GSS] data:", JSON.stringify(data));
      return data;
    } catch (e) {
      console.log("[GSS] error:", e);
      return null;
    }
  },
);
