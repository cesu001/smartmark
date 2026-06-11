"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

type LoginInput = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Logged in successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(
        "An error occurred while trying to log in. Please try again.",
      );
    }
  };
  return (
    <form id="user_login" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email" className="font-bold">
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="email"
                  autoComplete="username"
                  placeholder="example@mail.com"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  {fieldState.invalid
                    ? fieldState.error?.message
                    : "Please enter your email address."}
                </FieldDescription>
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password" className="font-bold">
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription className="flex justify-between items-center">
                  <span
                    className={fieldState.invalid ? "text-destructive" : ""}
                  >
                    {fieldState.invalid
                      ? fieldState.error?.message
                      : "Please enter your password."}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.replace("/forgot-password")}
                    className="cursor-pointer transition-colors duration-200 hover:text-primary/80"
                  >
                    Forgot password?
                  </button>
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Field orientation="vertical" className="mt-4">
        <Button
          form="user_login"
          type="submit"
          disabled={form.formState.isSubmitting}
          className="font-semibold transition-all duration-200 hover:scale-102"
        >
          {form.formState.isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Field>
      <Field className="mt-2">
        <FieldDescription className="font-semibold text-center">
          <span>Not got an account yet? Sign up </span>
          <button
            type="button"
            onClick={() => router.replace("/register")}
            className="cursor-pointer text-primary transition-colors duration-200 hover:text-primary/80"
          >
            here
          </button>
          <span>.</span>
        </FieldDescription>
      </Field>
    </form>
  );
};

export default LoginForm;
