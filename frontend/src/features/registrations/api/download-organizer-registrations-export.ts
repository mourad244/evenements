import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

type OrganizerRegistrationsExportPayload = {
  eventId: string;
};

type OrganizerRegistrationsExportSuccess = {
  filename: string;
  contentType: string;
};

type OrganizerRegistrationsExportError = Error & {
  status?: number;
  retryable?: boolean;
};

const EXPORT_ERROR_COPY: Record<number, { message: string; retryable: boolean }> = {
  401: {
    message: "Your session has expired. Please sign in and retry.",
    retryable: false
  },
  403: {
    message: "You are not allowed to export registrations for this event.",
    retryable: false
  },
  404: {
    message: "This event is not available in your organizer scope anymore.",
    retryable: false
  },
  502: {
    message: "Registration export is temporarily unavailable. Please retry.",
    retryable: true
  }
};

export async function downloadOrganizerRegistrationsExport({
  eventId
}: OrganizerRegistrationsExportPayload): Promise<OrganizerRegistrationsExportSuccess> {
  const normalizedEventId = String(eventId || "").trim();
  if (!normalizedEventId) {
    throw createOrganizerExportError(400, "Event export is unavailable.", false);
  }

  try {
    const response = await apiClient.get(
      ENDPOINTS.registrations.organizerEventRegistrationsExport(normalizedEventId),
      {
        responseType: "blob",
        headers: {
          accept: "text/csv"
        }
      }
    );

    const contentType = String(
      response.headers["content-type"] || response.data?.type || "text/csv"
    );
    const filename = resolveDownloadFilename(
      response.headers["content-disposition"],
      `registrations-${normalizedEventId}.csv`
    );
    const blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: contentType });

    triggerBrowserDownload(blob, filename);

    return {
      filename,
      contentType
    };
  } catch (error) {
    throw mapOrganizerExportError(error);
  }
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  if (typeof window === "undefined") {
    return;
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
}

function resolveDownloadFilename(
  contentDisposition: string | undefined,
  fallback: string
) {
  const disposition = String(contentDisposition || "").trim();
  if (!disposition) {
    return fallback;
  }

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return sanitizeFilename(safelyDecodeURIComponent(utf8Match[1]) || fallback);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) {
    return sanitizeFilename(plainMatch[1]);
  }

  return fallback;
}

function mapOrganizerExportError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = Number(error.response?.status || 500);
    const matched = EXPORT_ERROR_COPY[status];
    if (matched) {
      return createOrganizerExportError(status, matched.message, matched.retryable);
    }

    return createOrganizerExportError(
      status,
      "Registration export failed. Please retry.",
      status >= 500
    );
  }

  if (error instanceof Error) {
    return createOrganizerExportError(500, error.message, true);
  }

  return createOrganizerExportError(
    500,
    "Registration export failed. Please retry.",
    true
  );
}

function createOrganizerExportError(
  status: number,
  message: string,
  retryable = false
) {
  const error = new Error(message) as OrganizerRegistrationsExportError;
  error.status = status;
  error.retryable = retryable;
  return error;
}

function safelyDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sanitizeFilename(value: string) {
  const normalized = String(value || "registrations.csv")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_");
  return normalized || "registrations.csv";
}
