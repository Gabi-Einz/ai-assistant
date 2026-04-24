import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Button, Label, Input, Spinner } from "@heroui/react";
import { registerSchema } from "@repo/shared";
import { authClient } from "~/lib/auth-client";

export function RegisterForm() {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      const { error } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.email,
      });
      if (error) {
        setGlobalError(error.message ?? "Registration failed. Please try again.");
        return;
      }
      await navigate({ to: "/chat" as any });
    },
  });

  return (
    <form
      className="flex flex-col gap-4 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {globalError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {globalError}
        </p>
      )}

      <form.Field
        name="email"
        validators={{ onBlur: registerSchema.shape.email }}
      >
        {(field) => {
          const err = field.state.meta.errors[0];
          const errMsg = err != null
            ? typeof err === "string" ? err : (err as { message?: string }).message
            : undefined;
          return (
            <div className="flex flex-col gap-1">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onBlur: registerSchema.shape.password }}
      >
        {(field) => {
          const err = field.state.meta.errors[0];
          const errMsg = err != null
            ? typeof err === "string" ? err : (err as { message?: string }).message
            : undefined;
          return (
            <div className="flex flex-col gap-1">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            fullWidth
            isDisabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Create account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
