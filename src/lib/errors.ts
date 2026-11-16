type ErrorBody = { message?: string | string[] };

export function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data && "message" in data) {
      const message = (data as ErrorBody).message;
      if (Array.isArray(message)) return message.join(" ");
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return "Something went wrong. Try again.";
}
