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

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotInput = z.infer<typeof forgotSchema>;

const ForgotForm = () => {
  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (data: ForgotInput) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });
      if (!res.ok) {
        try {
          const errorResult = await res.json();
          toast.error(
            errorResult.error || "Failed to send reset link. Please try again.",
          );
        } catch {
          toast.error("Server error. Please try again.");
        }
        return;
      }
      const result = await res.json();
      const { message } = result;
      toast.success(message || "Reset link sent. Please check your email.");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };
  return (
    <form id="user_forgot" onSubmit={form.handleSubmit(onSubmit)}>
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
        </FieldGroup>
      </FieldSet>
      <Field orientation="vertical" className="mt-4">
        <Button
          form="user_forgot"
          type="submit"
          disabled={form.formState.isSubmitting}
          className="font-semibold transition-all duration-200 hover:scale-102"
        >
          {form.formState.isSubmitting ? "Sending..." : "Send"}
        </Button>
      </Field>
    </form>
  );
};

export default ForgotForm;
