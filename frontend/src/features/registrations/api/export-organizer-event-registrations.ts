import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

function parseFileName(contentDisposition?: string) {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
  if (!match?.[1]) return null;
  return match[1].replace(/"/g, "").trim();
}

export async function exportOrganizerEventRegistrations(eventId: string) {
  try {
    const response = await apiClient.get(
      ENDPOINTS.registrations.organizerEventRegistrationsExport(eventId),
      {
        responseType: "blob",
        headers: {
          Accept: "text/csv"
        }
      }
    );

    if (typeof window === "undefined") {
      return { fileName: null };
    }

    const fileName =
      parseFileName(response.headers["content-disposition"]) ||
      `event-registrations-${eventId}.csv`;
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "text/csv"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { fileName };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
