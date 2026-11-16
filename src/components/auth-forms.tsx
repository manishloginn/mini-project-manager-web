"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/errors";
import { validateAuth } from "@/lib/validate";
import { setSession } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";
import { useLoginMutation, useRegisterMutation } from "@/store/api";
import { Alert, BusyLabel, Button, Field, TextInput } from "./ui";
import { RequireGuest } from "./shell";

function AuthCard({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="motion-rise mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-16">
      <p className="font-serif text-sm tracking-wide text-accent">Mini Project Manager</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{lede}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateAuth({ email, password });
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;
    try {
      const result = await login({ email: email.trim(), password }).unwrap();
      dispatch(setSession(result));
      router.push("/projects");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <RequireGuest>
      <AuthCard title="Sign in" lede="Your projects stay private to this account.">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}
          <Field label="Email" error={errors.email}>
            <TextInput
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <TextInput
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <BusyLabel>Signing in…</BusyLabel> : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Demo account: ava@demo.com / Demo1234
        </p>
        <p className="mt-2 text-sm">
          <Link href="/register" className="text-accent underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </RequireGuest>
  );
}

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateAuth({ name, email, password, requireName: true });
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length > 0) return;
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap();
      dispatch(setSession(result));
      router.push("/projects");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <RequireGuest>
      <AuthCard title="Create an account" lede="Email and a password. Nothing else is shared.">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {formError ? <Alert>{formError}</Alert> : null}
          <Field label="Name" error={errors.name}>
            <TextInput
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <BusyLabel>Creating…</BusyLabel> : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-accent underline underline-offset-4">
            Already have an account
          </Link>
        </p>
      </AuthCard>
    </RequireGuest>
  );
}
