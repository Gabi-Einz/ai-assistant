import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent } from "@heroui/react";
import { getServerSession } from "~/lib/auth-fns";
import { RegisterForm } from "~/components/auth/RegisterForm";
import { LoginForm } from "~/components/auth/LoginForm";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const session = await getServerSession();
    if (session?.session) {
      throw redirect({ to: "/chat" as any });
    }
  },
  component: AuthPage,
});

type Tab = "register" | "login";

function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("register");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="mb-6 text-center text-2xl font-bold">AI Assistant</h1>
          <div className="mb-4 flex border-b border-default-200">
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "border-b-2 border-primary text-primary"
                  : "text-default-500 hover:text-default-800"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "border-b-2 border-primary text-primary"
                  : "text-default-500 hover:text-default-800"
              }`}
            >
              Login
            </button>
          </div>
          {activeTab === "register" ? <RegisterForm /> : <LoginForm />}
        </CardContent>
      </Card>
    </div>
  );
}
