"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { validateTitle } from "@/lib/validate";
import { Project } from "@/lib/types";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useListProjectsQuery,
  useUpdateProjectMutation,
} from "@/store/api";
import { RequireAuth } from "./shell";
import { Alert, BusyLabel, Button, ConfirmButton, Field, Loader, Pager, Progress, TextArea, TextInput } from "./ui";

function ProjectForm({
  initial,
  busy,
  error,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: { title: string; description: string };
  busy: boolean;
  error: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (value: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [titleError, setTitleError] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validateTitle(title, "Title");
    setTitleError(next);
    if (next) return;
    onSubmit({ title: title.trim(), description: description.trim() });
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
      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? <BusyLabel>Saving…</BusyLabel> : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const [editing, setEditing] = useState(false);
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [deleteProject, deleteState] = useDeleteProjectMutation();
  const [error, setError] = useState("");

  if (editing) {
    return (
      <ProjectForm
        initial={{ title: project.title, description: project.description }}
        busy={updateState.isLoading}
        error={error}
        submitLabel="Save project"
        onCancel={() => setEditing(false)}
        onSubmit={async (value) => {
          try {
            await updateProject({ id: project.id, body: value }).unwrap();
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
      className="motion-rise border border-line bg-paper p-4"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">
            <Link href={`/projects/${project.id}`} className="underline-offset-4 hover:underline">
              {project.title}
            </Link>
          </h2>
          {project.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{project.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="text-sm text-accent" onClick={() => setEditing(true)}>
            Edit
          </button>
          <ConfirmButton
            label="Delete"
            busy={deleteState.isLoading}
            onConfirm={() => deleteProject(project.id)}
          />
        </div>
      </div>
      <div className="mt-4">
        <Progress counts={project.counts} />
      </div>
    </article>
  );
}

function ProjectsBody() {
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { data, isFetching, isError, refetch } = useListProjectsQuery({ page });
  const [createProject, createState] = useCreateProjectMutation();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Projects</h1>
          <p className="mt-2 text-sm text-muted">Only you can see what you add here.</p>
        </div>
        {!creating ? (
          <Button type="button" onClick={() => setCreating(true)}>
            New project
          </Button>
        ) : null}
      </div>

      {creating ? (
        <div className="mt-6">
          <ProjectForm
            busy={createState.isLoading}
            error={error}
            submitLabel="Create project"
            onCancel={() => {
              setCreating(false);
              setError("");
            }}
            onSubmit={async (value) => {
              try {
                await createProject(value).unwrap();
                setCreating(false);
                setPage(1);
              } catch (caught) {
                setError(getErrorMessage(caught));
              }
            }}
          />
        </div>
      ) : null}

      {isError ? (
        <div className="mt-8">
          <Alert>Projects could not be loaded.</Alert>
          <Button className="mt-4" variant="ghost" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {isFetching && !data ? <Loader label="Loading projects…" /> : null}
      {isFetching && data ? <Loader compact className="mt-6" label="Updating projects…" /> : null}

      {data && data.data.length === 0 ? (
        <p className="motion-rise mt-10 border border-dashed border-line px-4 py-8 text-sm text-muted">
          No projects yet. Create one to start tracking tasks.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {data?.data.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index} />
        ))}
      </div>

      {data ? (
        <Pager
          page={data.meta.page}
          limit={data.meta.limit}
          total={data.meta.total}
          onPage={setPage}
        />
      ) : null}
    </div>
  );
}

export function ProjectsView() {
  return (
    <RequireAuth>
      <ProjectsBody />
    </RequireAuth>
  );
}
