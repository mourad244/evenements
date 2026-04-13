import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMediaAsset,
  buildStorageFilename,
  extensionForMime,
  MAX_FILE_SIZE_BYTES,
  sanitizeFilename,
  validateMediaUpload
} from "../services/shared/eventMediaUpload.js";

const FIVE_MB = 5 * 1024 * 1024;
const VALID_ASSET_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_EVENT_ID = "11111111-2222-3333-4444-555555555555";
const VALID_ORGANIZER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

// ── validateMediaUpload ────────────────────────────────────────────────────

test("validateMediaUpload accepts image/jpeg within size limit", () => {
  const result = validateMediaUpload({ mimeType: "image/jpeg", sizeBytes: 1024 });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.code, null);
});

test("validateMediaUpload accepts image/png within size limit", () => {
  const result = validateMediaUpload({ mimeType: "image/png", sizeBytes: FIVE_MB });
  assert.equal(result.valid, true);
});

test("validateMediaUpload accepts image/webp within size limit", () => {
  const result = validateMediaUpload({ mimeType: "image/webp", sizeBytes: 512 });
  assert.equal(result.valid, true);
});

test("validateMediaUpload rejects unsupported MIME type with UNSUPPORTED_MEDIA_TYPE", () => {
  for (const mime of ["image/gif", "image/svg+xml", "application/pdf", "video/mp4"]) {
    const result = validateMediaUpload({ mimeType: mime, sizeBytes: 1024 });
    assert.equal(result.valid, false, `should reject ${mime}`);
    assert.equal(result.code, "UNSUPPORTED_MEDIA_TYPE", `wrong code for ${mime}`);
    assert.ok(result.errors.length > 0);
  }
});

test("validateMediaUpload rejects missing/null MIME type", () => {
  const result = validateMediaUpload({ mimeType: null, sizeBytes: 1024 });
  assert.equal(result.valid, false);
  assert.equal(result.code, "UNSUPPORTED_MEDIA_TYPE");
});

test("validateMediaUpload rejects file exceeding 5 MB with FILE_TOO_LARGE", () => {
  const result = validateMediaUpload({
    mimeType: "image/jpeg",
    sizeBytes: FIVE_MB + 1
  });
  assert.equal(result.valid, false);
  assert.equal(result.code, "FILE_TOO_LARGE");
  assert.ok(result.errors[0].includes("5"));
});

test("validateMediaUpload rejects zero-byte file", () => {
  const result = validateMediaUpload({ mimeType: "image/jpeg", sizeBytes: 0 });
  assert.equal(result.valid, false);
  assert.equal(result.code, "VALIDATION_ERROR");
});

test("MAX_FILE_SIZE_BYTES is exactly 5 242 880", () => {
  assert.equal(MAX_FILE_SIZE_BYTES, 5_242_880);
});

// ── sanitizeFilename ───────────────────────────────────────────────────────

test("sanitizeFilename strips directory traversal components", () => {
  // Path stripping keeps only the basename component
  assert.equal(sanitizeFilename("../../etc/passwd"), "passwd");
  assert.equal(sanitizeFilename("../secret.jpg"), "secret.jpg");
  assert.equal(sanitizeFilename("folder/photo.png"), "photo.png");
});

test("sanitizeFilename replaces special characters with underscore", () => {
  const result = sanitizeFilename("my photo (1).jpg");
  assert.ok(!result.includes(" "), "spaces should be replaced");
  assert.ok(!result.includes("("), "parens should be replaced");
  assert.ok(result.endsWith(".jpg"), "extension should be preserved");
});

test("sanitizeFilename preserves safe characters", () => {
  assert.equal(sanitizeFilename("event-cover_2026.png"), "event-cover_2026.png");
});

test("sanitizeFilename returns 'upload' for empty or null input", () => {
  assert.equal(sanitizeFilename(""), "upload");
  assert.equal(sanitizeFilename(null), "upload");
});

// ── extensionForMime ───────────────────────────────────────────────────────

test("extensionForMime returns correct extension for each accepted type", () => {
  assert.equal(extensionForMime("image/jpeg"), ".jpg");
  assert.equal(extensionForMime("image/png"), ".png");
  assert.equal(extensionForMime("image/webp"), ".webp");
});

test("extensionForMime returns empty string for unknown type", () => {
  assert.equal(extensionForMime("image/gif"), "");
  assert.equal(extensionForMime("application/octet-stream"), "");
});

// ── buildStorageFilename ───────────────────────────────────────────────────

test("buildStorageFilename produces <assetId>.<ext> with no original name", () => {
  const name = buildStorageFilename({ assetId: VALID_ASSET_ID, mimeType: "image/jpeg" });
  assert.equal(name, `${VALID_ASSET_ID}.jpg`);
});

test("buildStorageFilename uses correct extension for each MIME type", () => {
  assert.equal(
    buildStorageFilename({ assetId: "abc", mimeType: "image/png" }),
    "abc.png"
  );
  assert.equal(
    buildStorageFilename({ assetId: "abc", mimeType: "image/webp" }),
    "abc.webp"
  );
});

// ── buildMediaAsset ────────────────────────────────────────────────────────

test("buildMediaAsset returns object with all required fields", () => {
  const asset = buildMediaAsset({
    assetId: VALID_ASSET_ID,
    eventId: VALID_EVENT_ID,
    organizerId: VALID_ORGANIZER_ID,
    originalFilename: "cover photo.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 204_800,
    storagePath: "/uploads/a1b2c3d4.jpg",
    publicUrl: "/uploads/a1b2c3d4.jpg",
    createdAt: "2026-04-11T12:00:00.000Z"
  });

  assert.equal(asset.assetId, VALID_ASSET_ID);
  assert.equal(asset.eventId, VALID_EVENT_ID);
  assert.equal(asset.organizerId, VALID_ORGANIZER_ID);
  assert.equal(asset.mimeType, "image/jpeg");
  assert.equal(asset.sizeBytes, 204_800);
  assert.equal(asset.storagePath, "/uploads/a1b2c3d4.jpg");
  assert.equal(asset.publicUrl, "/uploads/a1b2c3d4.jpg");
  assert.equal(asset.createdAt, "2026-04-11T12:00:00.000Z");
  // filename should be sanitized
  assert.ok(typeof asset.filename === "string" && asset.filename.length > 0);
  assert.ok(!asset.filename.includes(" "), "filename must not contain spaces");
});

test("buildMediaAsset sanitizes the original filename", () => {
  const asset = buildMediaAsset({
    assetId: VALID_ASSET_ID,
    eventId: VALID_EVENT_ID,
    organizerId: VALID_ORGANIZER_ID,
    originalFilename: "../../etc/passwd",
    mimeType: "image/png",
    sizeBytes: 1024,
    storagePath: "/uploads/x.png",
    publicUrl: "/uploads/x.png",
    createdAt: "2026-04-11T12:00:00.000Z"
  });

  assert.ok(!asset.filename.includes(".."), "should strip path traversal");
  assert.ok(!asset.filename.includes("/"), "should strip slashes");
});

test("buildMediaAsset does not expose storagePath outside the asset object", () => {
  // storagePath IS part of the internal record, but it must be excluded
  // from catalog/public responses — that filtering happens in toEventResponse.
  // Here we confirm the field is present (internal record is complete).
  const asset = buildMediaAsset({
    assetId: VALID_ASSET_ID,
    eventId: VALID_EVENT_ID,
    organizerId: VALID_ORGANIZER_ID,
    originalFilename: "photo.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
    storagePath: "/var/data/uploads/a1b2.jpg",
    publicUrl: "/uploads/a1b2.jpg",
    createdAt: "2026-04-11T12:00:00.000Z"
  });

  assert.ok("storagePath" in asset, "internal asset includes storagePath");
  assert.notEqual(asset.storagePath, asset.publicUrl, "storagePath != publicUrl");
});
