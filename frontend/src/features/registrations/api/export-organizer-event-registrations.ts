import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

type OrganizerExportResult = {
  blob: Blob;
  filename: string;
};

function extractFilename(contentDisposition?: string | null) {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(
    /filename\*?=(?:UTF-8''|")?([^\";]+)/i
  );
  if (!match) return null;
  const rawName = match[1].replace(/"/g, "").trim();
  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

export async function exportOrganizerEventRegistrations(
  eventId: string
): Promise<OrganizerExportResult> {
  try {
    const response = await apiClient.get(
      ENDPOINTS.registrations.organizerEventRegistrationsExport(eventId),
      {
        responseType: "blob"
      }
    );
    const filename =
      extractFilename(response.headers?.["content-disposition"]) ||
      `event-${eventId}-registrations.csv`;

    return {
      blob: response.data as Blob,
      filename
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
