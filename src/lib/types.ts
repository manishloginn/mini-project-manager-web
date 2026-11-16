export type TaskStatus = "todo" | "in-progress" | "done";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  user: PublicUser;
};

export type TaskCounts = {
  todo: number;
  "in-progress": number;
  done: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  counts: TaskCounts;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Page<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number };
};

export type ProjectInput = {
  title: string;
  description?: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
};
