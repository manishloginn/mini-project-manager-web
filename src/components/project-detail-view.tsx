"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { formatDueDate, isOverdue, STATUS_LABEL, toDateInput } from "@/lib/format";
import { Task, TaskStatus } from "@/lib/types";
import { validateTitle } from "@/lib/validate";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectQuery,
  useListTasksQuery,
  useUpdateTaskMutation,
} from "@/store/api";
import { RequireAuth } from "./shell";
import { Alert, BusyLabel, Button, ConfirmButton, Field, Loader, Pager, Progress, TextArea, TextInput } from "./ui";

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

function TaskForm({
  initial,
  busy,
  error,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: { title: string; description: string; status: TaskStatus; dueDate: string };
  busy: boolean;
  error: string;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (value: {
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: string;
  }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [titleError, setTitleError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateTitle(title, "Title");
    setTitleError(next);
    if (next) return;
    onSubmit({ title: title.trim(), description: description.trim(), status, dueDate });
  }

  return (
    <form className="motion-reveal space-y-4 border border-line bg-paper p-4" onSubmit={handleSubmit}>
      {error ? <Alert>{error}</Alert> : null}
      <Field label="Title" error={titleError}>
        <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="Description">
        <TextArea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due date">
          <TextInput type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </Field>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? <BusyLabel>Saving…</BusyLabel> : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function statusClass(status: TaskStatus) {
  if (status === "done") return "text-done";
  if (status === "in-progress") return "text-warn";
  return "text-muted";
}

function TaskRow({ task, projectId, index }: { task: Task; projectId: string; index: number }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [updateTask, updateState] = useUpdateTaskMutation();
  const [deleteTask, deleteState] = useDeleteTaskMutation();
  const overdue = isOverdue(task);

  if (editing) {
    return (
      <TaskForm
        initial={{
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: toDateInput(task.dueDate),
        }}
        busy={updateState.isLoading}
        error={error}
        submitLabel="Save task"
        onCancel={() => setEditing(false)}
        onSubmit={async (value) => {
          try {
            await updateTask({
              id: task.id,
              projectId,
              body: {
                title: value.title,
                description: value.description,
                status: value.status,
                dueDate: value.dueDate || null,
              },
            }).unwrap();
            setEditing(false);
          } catch (caught) {
            setError(getErrorMessage(caught));
          }
        }}
      />
    );
  }

  return (
    <article
      className="motion-rise border border-line bg-paper px-4 py-3"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">{task.title}</h3>
          {task.description ? <p className="mt-1 text-sm text-muted">{task.description}</p> : null}
          <p className="mt-2 text-sm">
            <span className={statusClass(task.status)}>{STATUS_LABEL[task.status]}</span>
            <span className="px-2 text-line">/</span>
            <span className={overdue ? "text-danger" : "text-muted"}>
              {formatDueDate(task.dueDate)}
              {overdue ? " · Overdue" : ""}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="text-sm text-accent" onClick={() => setEditing(true)}>
            Edit
          </button>
          <ConfirmButton
            label="Delete"
            busy={deleteState.isLoading}
            onConfirm={() => deleteTask({ id: task.id, projectId })}
          />
        </div>
      </div>
    </article>
  );
}

function DetailBody() {
  const params = useParams<{ id: string }>();
  return <DetailInner key={params.id} id={params.id} />;
}

function DetailInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const overdue = searchParams.get("overdue") === "true";
  const sort = searchParams.get("sort") === "status" ? "status" : "dueDate";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const projectQuery = useGetProjectQuery(id);
  const tasksQuery = useListTasksQuery({
    projectId: id,
    status: status || undefined,
    overdue,
    sort,
    order,
    page,
  });
  const [createTask, createState] = useCreateTaskMutation();

  function updateFilters(next: Record<string, string | null>) {
    const paramsNext = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) paramsNext.delete(key);
      else paramsNext.set(key, value);
    }
    const query = paramsNext.toString();
    router.replace(query ? `/projects/${id}?${query}` : `/projects/${id}`);
  }

  const projectMissing = projectQuery.error && "status" in projectQuery.error && projectQuery.error.status === 404;

  return (
    <div>
      <Link href="/projects" className="text-sm text-accent underline underline-offset-4">
        All projects
      </Link>

      {projectQuery.isLoading ? <Loader label="Loading project…" /> : null}

      {projectMissing ? (
        <div className="mt-6">
          <Alert>This project does not exist, or it belongs to someone else.</Alert>
        </div>
      ) : null}

      {projectQuery.data ? (
        <>
          <h1 className="mt-4 font-serif text-4xl">{projectQuery.data.title}</h1>
          {projectQuery.data.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{projectQuery.data.description}</p>
          ) : null}
          <div className="mt-5 max-w-md">
            <Progress counts={projectQuery.data.counts} />
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-muted">Status</span>
              <select
                className="rounded-md border border-line bg-paper px-3 py-2"
                value={status}
                onChange={(event) => updateFilters({ status: event.target.value || null, page: null })}
              >
                <option value="">All</option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABEL[item]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={overdue}
                onChange={(event) =>
                  updateFilters({ overdue: event.target.checked ? "true" : null, page: null })
                }
              />
              Overdue only
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Sort</span>
              <select
                className="rounded-md border border-line bg-paper px-3 py-2"
                value={sort}
                onChange={(event) => updateFilters({ sort: event.target.value, page: null })}
              >
                <option value="dueDate">Due date</option>
                <option value="status">Status</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Order</span>
              <select
                className="rounded-md border border-line bg-paper px-3 py-2"
                value={order}
                onChange={(event) => updateFilters({ order: event.target.value, page: null })}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
            {!creating ? (
              <Button type="button" className="mb-0.5" onClick={() => setCreating(true)}>
                New task
              </Button>
            ) : null}
          </div>

          {creating ? (
            <div className="mt-4">
              <TaskForm
                busy={createState.isLoading}
                error={error}
                submitLabel="Add task"
                onCancel={() => {
                  setCreating(false);
                  setError("");
                }}
                onSubmit={async (value) => {
                  try {
                    await createTask({
                      projectId: id,
                      body: {
                        title: value.title,
                        description: value.description,
                        status: value.status,
                        dueDate: value.dueDate || null,
                      },
                    }).unwrap();
                    setCreating(false);
                    updateFilters({ page: null });
                  } catch (caught) {
                    setError(getErrorMessage(caught));
                  }
                }}
              />
            </div>
          ) : null}

          {tasksQuery.isError ? (
            <div className="mt-6">
              <Alert>Tasks could not be loaded.</Alert>
            </div>
          ) : null}
          {tasksQuery.isFetching && !tasksQuery.data ? <Loader label="Loading tasks…" /> : null}
          {tasksQuery.isFetching && tasksQuery.data ? (
            <Loader compact className="mt-4" label="Updating tasks…" />
          ) : null}
          {tasksQuery.data && tasksQuery.data.data.length === 0 ? (
            <p className="motion-rise mt-6 border border-dashed border-line px-4 py-8 text-sm text-muted">
              No tasks match this view.
            </p>
          ) : null}
          <div className="mt-4 space-y-3">
            {tasksQuery.data?.data.map((task, index) => (
              <TaskRow key={task.id} task={task} projectId={id} index={index} />
            ))}
          </div>
          {tasksQuery.data ? (
            <Pager
              page={tasksQuery.data.meta.page}
              limit={tasksQuery.data.meta.limit}
              total={tasksQuery.data.meta.total}
              onPage={(nextPage) => updateFilters({ page: nextPage <= 1 ? null : String(nextPage) })}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function ProjectDetailView() {
  return (
    <RequireAuth>
      <DetailBody />
    </RequireAuth>
  );
}
