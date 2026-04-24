import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, TabList, TabPanel, Tab, Tabs } from "@heroui/react";
import { authClient } from "~/lib/auth-client";
import { RegisterForm } from "~/components/auth/RegisterForm";
import { LoginForm } from "~/components/auth/LoginForm";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data?.session) {
      throw redirect({ to: "/chat" as any });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="mb-6 text-center text-2xl font-bold">AI Assistant</h1>
          <Tabs defaultSelectedKey="register">
            <TabList>
              <Tab id="register">Register</Tab>
              <Tab id="login">Login</Tab>
            </TabList>
            <TabPanel id="register">
              <RegisterForm />
            </TabPanel>
            <TabPanel id="login">
              <LoginForm />
            </TabPanel>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
