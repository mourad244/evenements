import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTicketDownloadContentType,
  buildTicketDownloadFilename,
  renderTicketArtifactBuffer
} from "../services/registration-service/src/ticketArtifactResponse.js";

test("buildTicketDownloadFilename matches the stored ticket format", () => {
  assert.equal(
    buildTicketDownloadFilename({
      ticketRef: "TCK-ATLAS-001",
      ticketFormat: "PDF"
    }),
    "TCK-ATLAS-001.pdf"
  );
  assert.equal(
    buildTicketDownloadFilename({
      ticketRef: "TCK-ATLAS-002",
      ticketFormat: "PNG"
    }),
    "TCK-ATLAS-002.png"
  );
});

test("buildTicketDownloadContentType returns the correct MIME type", () => {
  assert.equal(
    buildTicketDownloadContentType({ ticketFormat: "PDF" }),
    "application/pdf"
  );
  assert.equal(
    buildTicketDownloadContentType({ ticketFormat: "PNG" }),
    "image/png"
  );
});

test("renderTicketArtifactBuffer returns a PDF artifact with ticket context", async () => {
  const buffer = renderTicketArtifactBuffer({
    ticketRef: "TCK-ATLAS-003",
    ticketFormat: "PDF",
    registrationId: "reg-1",
    eventId: "evt-1",
    payload: {
      eventTitle: "Atlas Summit",
      eventCity: "Casablanca",
      eventStartAt: "2026-04-02T09:00:00.000Z",
      participantName: "Sara Bennani"
    },
    createdAt: "2026-04-01T10:00:00.000Z"
  });

  const text = buffer.toString("utf8");
  assert.match(text, /^%PDF-1\.4/);
  assert.match(text, /Atlas Summit/);
  assert.match(text, /Sara Bennani/);
});

test("renderTicketArtifactBuffer returns a PNG artifact when requested", () => {
  const buffer = renderTicketArtifactBuffer({
    ticketRef: "TCK-ATLAS-004",
    ticketFormat: "PNG"
  });

  assert.equal(buffer[0], 0x89);
  assert.equal(buffer[1], 0x50);
  assert.equal(buffer[2], 0x4e);
  assert.equal(buffer[3], 0x47);
});
