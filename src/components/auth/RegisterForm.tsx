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
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
    consent: z.literal(true, {
      error: "You must agree to the Privacy Policy to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      if (!res.ok) {
        try {
          const errorResult = await res.json();
          toast.error(
            errorResult.error || "Registration failed. Please try again.",
          );
        } catch {
          toast.error("Server error. Please try again.");
        }
        return;
      }
      const result = await res.json();
      toast.success("Registration successful! Logging you in...");
      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (loginResult?.error) {
        toast.error(
          "Registration succeeded but login failed. Please try logging in manually.",
        );
        window.location.href = "/login";
        return;
      }
      if (loginResult?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };
  return (
    <form id="user_register" onSubmit={form.handleSubmit(onSubmit)}>
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
                  autoComplete="email"
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
                  autoComplete="new-password"
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
                  Confirm Password
                </FieldLabel>
                <Input
                  {...field}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription
                  className={fieldState.invalid ? "text-destructive" : ""}
                >
                  {fieldState.invalid
                    ? fieldState.error?.message
                    : "Please confirm your password."}
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <Controller
        name="consent"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="mt-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id="consent"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
                className="mt-0.5"
              />
              <FieldLabel
                htmlFor="consent"
                className="text-sm font-normal leading-snug"
              >
                <span>
                  I agree to the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 transition-colors duration-200 hover:text-primary/80 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </FieldLabel>
            </div>
            {fieldState.invalid && (
              <FieldDescription className="text-destructive">
                {fieldState.error?.message}
              </FieldDescription>
            )}
          </Field>
        )}
      />
      <Field orientation="vertical" className="mt-4">
        <Button
          form="user_register"
          type="submit"
          disabled={form.formState.isSubmitting}
          className="font-semibold transition-all duration-200 hover:scale-102"
        >
          {form.formState.isSubmitting ? "Registering..." : "Register"}
        </Button>
      </Field>
      <Field className="mt-2">
        <FieldDescription className="font-semibold text-center">
          <span>Already got an account ? Sign in </span>
          <button
            type="button"
            onClick={() => router.replace("/login")}
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
export default RegisterForm;
