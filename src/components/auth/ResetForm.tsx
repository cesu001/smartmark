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
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetInput = z.infer<typeof resetSchema>;

type ResetFormProps = {
  token?: string;
};
const ResetForm = ({ token }: ResetFormProps) => {
  const router = useRouter();
  const form = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: ResetInput) => {
    if (!token) {
      toast.error("Invalid or missing token. Please request a new link.");
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });
      if (!res.ok) {
        try {
          const errorResult = await res.json();
          toast.error(
            errorResult.error || "Failed to reset password. Please try again.",
          );
        } catch {
          toast.error("Server error. Please try again.");
        }
        return;
      }
      const result = await res.json();
      toast.success(
        result.message || "Your password has been reset successfully!",
      );
      try {
        await signOut({ redirect: false });
      } catch (signOutError) {
        console.error(signOutError);
      }
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };
  return (
    <form id="user_reset" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password" className="font-bold">
                  New Password
                </FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={!token}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  {fieldState.invalid
                    ? fieldState.error?.message
                    : "Password must be at least 6 characters long."}
                </FieldDescription>
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword" className="font-bold">
                  Confirm New Password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  disabled={!token}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  {fieldState.invalid
                    ? fieldState.error?.message
                    : "Please confirm your new password."}
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Field orientation="vertical" className="mt-4">
        <Button
          form="user_reset"
          type="submit"
          disabled={form.formState.isSubmitting || !token}
          className="font-semibold transition-all duration-200 hover:scale-102"
        >
          {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </Field>
      {!token && (
        <Field className="mt-2">
          <FieldDescription className="font-semibold text-center">
            <span>Get a new reset link </span>
            <Link
              href="/forgot-password"
              className="no-underline! transition-colors duration-100 text-primary hover:text-green-500!"
            >
              here
            </Link>
            <span>.</span>
          </FieldDescription>
        </Field>
      )}
    </form>
  );
};

export default ResetForm;
