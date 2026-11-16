import { Task, TaskCounts, TaskStatus } from "./types";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export function taskTotal(counts: TaskCounts) {
  return counts.todo + counts["in-progress"] + counts.done;
}

export function donePercent(counts: TaskCounts) {
  const total = taskTotal(counts);
  if (total === 0) return 0;
  return Math.round((counts.done / total) * 100);
}

export function formatDueDate(iso: string | null) {
  if (!iso) return "No due date";
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function isOverdue(task: Pick<Task, "dueDate" | "status">) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}
