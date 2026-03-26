const DEFAULT_TICKET_BASE_PATH = "/api/tickets";

const DOWNLOAD_ERROR_MATRIX = {
  401: {
    code: "UNAUTHENTICATED",
    message: "Session expired. Please log in again.",
    action: "REDIRECT_LOGIN",
    retryable: false
  },
  403: {
    code: "FORBIDDEN",
    message: "You are not allowed to download this ticket.",
    action: "SHOW_FORBIDDEN",
    retryable: false
  },
  404: {
    code: "TICKET_NOT_READY",
    message: "Ticket unavailable for now.",
    action: "SHOW_UNAVAILABLE",
    retryable: false
  },
  502: {
    code: "UPSTREAM_UNAVAILABLE",
    message: "Ticket service is temporarily unavailable.",
    action: "RETRY",
    retryable: true
  }
};

export function isTicketDownloadEligible(registration = {}) {
  const status = String(registration.registrationStatus || "").toUpperCase();
  const ticketId = String(registration.ticketId || "").trim();
  return (
    status === "CONFIRMED" &&
    registration.canDownloadTicket === true &&
    ticketId.length > 0
  );
}

export function buildTicketDownloadPath(
  ticketId,
  { basePath = DEFAULT_TICKET_BASE_PATH } = {}
) {
  const normalizedTicketId = String(ticketId || "").trim();
  if (!normalizedTicketId) {
    throw new Error("ticketId is required");
  }
  const normalizedBasePath = String(basePath || DEFAULT_TICKET_BASE_PATH).replace(
    /\/+$/,
    ""
  );
  return `${normalizedBasePath}/${encodeURIComponent(normalizedTicketId)}/download`;
}

export function mapTicketDownloadError(status) {
  const numericStatus = Number(status) || 0;
  const matched = DOWNLOAD_ERROR_MATRIX[numericStatus];
  if (matched) {
    return {
      status: numericStatus,
      ...matched
    };
  }

  return {
    status: numericStatus,
    code: "DOWNLOAD_FAILED",
    message: "Ticket download failed.",
    action: "SHOW_ERROR",
    retryable: numericStatus >= 500
  };
}

export function resolveDownloadFilename(headersLike, fallback = "ticket.pdf") {
  const disposition = readHeader(headersLike, "content-disposition");
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match && utf8Match[1]) {
    const decoded = safelyDecodeURIComponent(utf8Match[1]);
    return sanitizeFilename(decoded || fallback);
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch && plainMatch[1]) {
    return sanitizeFilename(plainMatch[1]);
  }

  return fallback;
}

export async function downloadProtectedTicket({
  fetchImpl = globalThis.fetch,
  ticketId,
  accessToken,
  correlationId,
  basePath = DEFAULT_TICKET_BASE_PATH,
  signal
}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl must be a function");
  }

  const token = String(accessToken || "").trim();
  if (!token) {
    return {
      ok: false,
      ...mapTicketDownloadError(401)
    };
  }

  const url = buildTicketDownloadPath(ticketId, { basePath });
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/pdf, image/png"
  };

  const normalizedCorrelationId = String(correlationId || "").trim();
  if (normalizedCorrelationId) {
    headers["x-correlation-id"] = normalizedCorrelationId;
  }

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers,
      signal
    });

    if (!response.ok) {
      return {
        ok: false,
        ...mapTicketDownloadError(response.status)
      };
    }

    const contentType =
      response.headers?.get?.("content-type") || "application/octet-stream";
    const fallbackFilename = contentType.includes("png")
      ? "ticket.png"
      : "ticket.pdf";
    const filename = resolveDownloadFilename(response.headers, fallbackFilename);
    const blob = await response.blob();

    return {
      ok: true,
      status: response.status,
      contentType,
      filename,
      blob
    };
  } catch (error) {
    return {
      ok: false,
      ...mapTicketDownloadError(502),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function readHeader(headersLike, name) {
  if (!headersLike) return null;
  if (typeof headersLike.get === "function") {
    return headersLike.get(name);
  }

  const target = String(name || "").toLowerCase();
  for (const [key, value] of Object.entries(headersLike)) {
    if (String(key).toLowerCase() === target) return value;
  }
  return null;
}

function sanitizeFilename(name) {
  const normalized = String(name || "").trim().replace(/[\\/:*?"<>|]/g, "_");
  return normalized || "ticket.pdf";
}

function safelyDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
