import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { RegistrationItem } from "../types/registration.types";

type TicketDownloadSuccess = {
  filename: string;
  contentType: string;
};

type TicketDownloadError = Error & {
  status?: number;
  retryable?: boolean;
};

const DOWNLOAD_ERROR_COPY: Record<number, { message: string; retryable: boolean }> = {
  401: {
    message: "Your session has expired. Please sign in and retry.",
    retryable: false
  },
  403: {
    message: "You are not allowed to download this ticket.",
    retryable: false
  },
  404: {
    message: "Ticket is not available yet for this registration.",
    retryable: false
  },
  502: {
    message: "Ticket service is temporarily unavailable. Please retry.",
    retryable: true
  }
};

export async function downloadTicket(
  registration: RegistrationItem
): Promise<TicketDownloadSuccess> {
  if (
    registration.status !== "CONFIRMED" ||
    registration.canDownloadTicket !== true ||
    !registration.ticketId
  ) {
    throw createTicketDownloadError(
      404,
      "Ticket is not available yet for this registration."
    );
  }

  try {
    const response = await apiClient.get(ENDPOINTS.tickets.download(registration.ticketId), {
      responseType: "blob",
      headers: {
        accept: "application/pdf, image/png"
      }
    });

    const contentType = String(
      response.headers["content-type"] || response.data?.type || "application/octet-stream"
    );
    const fallbackFilename = contentType.includes("png")
      ? `${registration.ticketId}.png`
      : `${registration.ticketId}.pdf`;
    const filename = resolveDownloadFilename(
      response.headers["content-disposition"],
      fallbackFilename
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
    throw mapTicketDownloadError(error);
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

function mapTicketDownloadError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = Number(error.response?.status || 500);
    const matched = DOWNLOAD_ERROR_COPY[status];
    if (matched) {
      return createTicketDownloadError(status, matched.message, matched.retryable);
    }

    return createTicketDownloadError(
      status,
      "Ticket download failed. Please retry.",
      status >= 500
    );
  }

  if (error instanceof Error) {
    return createTicketDownloadError(500, error.message, true);
  }

  return createTicketDownloadError(500, "Ticket download failed. Please retry.", true);
}

function createTicketDownloadError(
  status: number,
  message: string,
  retryable = false
) {
  const error = new Error(message) as TicketDownloadError;
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
  const normalized = String(value || "ticket.pdf")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_");
  return normalized || "ticket.pdf";
}
