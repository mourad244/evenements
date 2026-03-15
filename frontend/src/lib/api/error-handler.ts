import axios from "axios";

export type NormalizedApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    return {
      message:
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        "Request failed",
      status: error.response?.status || 500,
      details: error.response?.data
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  return { message: "Unknown error", status: 500 };
}
