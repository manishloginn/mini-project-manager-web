"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clearSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader } from "./ui";

export function Shell({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/projects" className="font-serif text-xl tracking-tight text-ink">
            Mini Project Manager
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:inline">{user?.name}</span>
            <button
              type="button"
              className="text-ink underline decoration-line underline-offset-4"
              onClick={() => {
                dispatch(clearSession());
                router.replace("/login");
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="motion-rise mx-auto w-full max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) {
    return <Loader label="Redirecting to login…" />;
  }

  return <Shell>{children}</Shell>;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/projects");
  }, [token, router]);

  if (token) {
    return <Loader label="Opening your projects…" />;
  }

  return children;
}
