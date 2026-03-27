import axios from "axios";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;

    // Fix for inheritance
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    // Backend returns errors in the 'error' field: { success: false, error: "message" }
    const message =
      (error.response?.data as { error?: string } | undefined)?.error ||
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      "Request failed";
    
    return new ApiError(
      message,
      error.response?.status || 500,
      error.response?.data
    );
  }

  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("Unknown error", 500);
}
