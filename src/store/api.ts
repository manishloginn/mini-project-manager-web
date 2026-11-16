import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { clearSession } from "./auth-slice";
import {
  AuthResponse,
  Page,
  Project,
  ProjectInput,
  PublicUser,
  Task,
  TaskInput,
} from "@/lib/types";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { token: string | null } }).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
      api.dispatch(clearSession());
    }
  }
  return result;
};

export const projectApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Project", "Task", "Me"],
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    me: build.query<PublicUser, void>({
      query: () => "/auth/me",
      providesTags: ["Me"],
    }),
    listProjects: build.query<Page<Project>, { page?: number }>({
      query: ({ page = 1 }) => `/projects?page=${page}&limit=20`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((project) => ({ type: "Project" as const, id: project.id })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    getProject: build.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Project", id }],
    }),
    createProject: build.mutation<Project, ProjectInput>({
      query: (body) => ({ url: "/projects", method: "POST", body }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    updateProject: build.mutation<Project, { id: string; body: ProjectInput }>({
      query: ({ id, body }) => ({ url: `/projects/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Project", id: arg.id },
        { type: "Project", id: "LIST" },
      ],
    }),
    deleteProject: build.mutation<{ deleted: boolean }, string>({
      query: (id) => ({ url: `/projects/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
    listTasks: build.query<
      Page<Task>,
      {
        projectId: string;
        status?: string;
        overdue?: boolean;
        sort?: "dueDate" | "status";
        order?: "asc" | "desc";
        page?: number;
      }
    >({
      query: ({ projectId, status, overdue, sort, order, page }) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (overdue) params.set("overdue", "true");
        if (sort) params.set("sort", sort);
        if (order) params.set("order", order);
        if (page) params.set("page", String(page));
        const query = params.toString();
        return `/projects/${projectId}/tasks${query ? `?${query}` : ""}`;
      },
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.data.map((task) => ({ type: "Task" as const, id: task.id })),
              { type: "Task" as const, id: `LIST-${arg.projectId}` },
            ]
          : [{ type: "Task" as const, id: `LIST-${arg.projectId}` }],
    }),
    createTask: build.mutation<Task, { projectId: string; body: TaskInput }>({
      query: ({ projectId, body }) => ({
        url: `/projects/${projectId}/tasks`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Task", id: `LIST-${arg.projectId}` },
        { type: "Project", id: arg.projectId },
        { type: "Project", id: "LIST" },
      ],
    }),
    updateTask: build.mutation<Task, { id: string; projectId: string; body: Partial<TaskInput> }>({
      query: ({ id, body }) => ({ url: `/tasks/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Task", id: arg.id },
        { type: "Task", id: `LIST-${arg.projectId}` },
        { type: "Project", id: arg.projectId },
        { type: "Project", id: "LIST" },
      ],
    }),
    deleteTask: build.mutation<{ deleted: boolean }, { id: string; projectId: string }>({
      query: ({ id }) => ({ url: `/tasks/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Task", id: `LIST-${arg.projectId}` },
        { type: "Project", id: arg.projectId },
        { type: "Project", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useListProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useListTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = projectApi;
