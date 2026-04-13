const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9VEWilQAAAAASUVORK5CYII=";

export function buildTicketDownloadFilename(ticket = {}) {
  const ticketRef = String(ticket.ticketRef || ticket.ticketId || "ticket").trim();
  const format = normalizeTicketFormat(ticket.ticketFormat);
  const extension = format === "PNG" ? "png" : "pdf";
  return `${sanitizeFilename(ticketRef)}.${extension}`;
}

export function buildTicketDownloadContentType(ticket = {}) {
  return normalizeTicketFormat(ticket.ticketFormat) === "PNG"
    ? "image/png"
    : "application/pdf";
}

export function renderTicketArtifactBuffer(ticket = {}) {
  const format = normalizeTicketFormat(ticket.ticketFormat);
  if (format === "PNG") {
    return Buffer.from(ONE_PIXEL_PNG_BASE64, "base64");
  }

  const payload = ticket.payload || {};
  const lines = [
    `Ticket reference: ${ticket.ticketRef || ticket.ticketId || "N/A"}`,
    `Event: ${payload.eventTitle || ticket.eventId || "Untitled event"}`,
    payload.eventCity ? `City: ${payload.eventCity}` : null,
    payload.eventStartAt ? `Starts at: ${payload.eventStartAt}` : null,
    payload.participantName ? `Participant: ${payload.participantName}` : null,
    `Registration: ${ticket.registrationId || "N/A"}`,
    `Issued at: ${ticket.createdAt || ticket.updatedAt || new Date().toISOString()}`
  ].filter(Boolean);

  return buildSimplePdfBuffer(lines);
}

function buildSimplePdfBuffer(lines) {
  const escapedLines = lines.map((line) =>
    String(line).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
  );
  const contentStream = [
    "BT",
    "/F1 12 Tf",
    "50 760 Td",
    ...escapedLines.flatMap((line, index) =>
      index === 0 ? [`(${line}) Tj`] : ["0 -18 Td", `(${line}) Tj`]
    ),
    "ET"
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function normalizeTicketFormat(format) {
  return String(format || "").trim().toUpperCase() === "PNG" ? "PNG" : "PDF";
}

function sanitizeFilename(value) {
  return String(value || "ticket")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_");
}
