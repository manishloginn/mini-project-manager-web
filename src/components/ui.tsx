"use client";

import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { donePercent, taskTotal } from "@/lib/format";
import { TaskCounts } from "@/lib/types";

const buttonStyles = {
  primary: "bg-accent text-paper hover:bg-accent-strong",
  ghost: "border border-line bg-paper text-ink hover:bg-bg",
  danger: "text-danger hover:underline",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition duration-150 ease-out hover:-translate-y-px active:translate-y-0 disabled:translate-y-0 disabled:opacity-50 motion-reduce:transform-none ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-line bg-paper px-3 py-2 text-sm ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-line bg-paper px-3 py-2 text-sm ${props.className ?? ""}`}
    />
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-danger">{error}</span> : null}
    </label>
  );
}

export function BusyLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="loader-ring loader-ring-sm" aria-hidden />
      {children}
    </span>
  );
}

export function Loader({
  label = "Loading…",
  compact = false,
  className = "",
}: {
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={
        compact
          ? `flex items-center gap-2 text-sm text-muted ${className}`
          : `flex flex-col items-center justify-center gap-3 px-5 py-12 text-sm text-muted ${className}`
      }
    >
      <span className={compact ? "loader-ring loader-ring-sm" : "loader-ring"} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="motion-reveal rounded-md border border-danger/30 bg-paper px-3 py-2 text-sm text-danger">
      {children}
    </p>
  );
}

export function Progress({ counts }: { counts: TaskCounts }) {
  const total = taskTotal(counts);
  const percent = donePercent(counts);
  return (
    <div>
      <div className="h-1.5 overflow-hidden bg-line" aria-hidden>
        <div key={percent} className="motion-bar h-full bg-progress" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {total === 0
          ? "No tasks yet"
          : `${counts.done} of ${total} done · ${counts["in-progress"]} in progress · ${counts.todo} to do`}
      </p>
    </div>
  );
}

export function ConfirmButton({
  label,
  onConfirm,
  busy,
}: {
  label: string;
  onConfirm: () => void;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="text-sm text-danger" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="motion-reveal inline-flex items-center gap-3 text-sm">
      <span className="text-muted">Delete this?</span>
      <button type="button" className="text-danger" disabled={busy} onClick={onConfirm}>
        Confirm
      </button>
      <button type="button" className="text-muted" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </span>
  );
}

export function Pager({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between text-sm">
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </Button>
      <span className="text-muted">
        Page {page} of {pages}
      </span>
      <Button variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </Button>
    </div>
  );
}
