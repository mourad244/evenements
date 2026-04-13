/**
 * eventMediaUpload.js
 *
 * Pure business-rule module for event media upload validation and asset
 * construction (ticket E04.2).  No I/O, no DB — safe to unit-test in
 * isolation.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MIME_TO_EXTENSION = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

/**
 * Validate an incoming media upload request.
 *
 * @param {{ mimeType: string, sizeBytes: number }} params
 * @returns {{ valid: boolean, errors: string[], code: string | null }}
 */
export function validateMediaUpload({ mimeType, sizeBytes }) {
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      errors: [
        `Unsupported MIME type: "${mimeType}". Accepted: image/jpeg, image/png, image/webp`
      ],
      code: "UNSUPPORTED_MEDIA_TYPE"
    };
  }

  if (typeof sizeBytes !== "number" || sizeBytes <= 0) {
    return {
      valid: false,
      errors: ["File size must be a positive number"],
      code: "VALIDATION_ERROR"
    };
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      errors: [
        `File size ${sizeBytes} bytes exceeds the maximum of ${MAX_FILE_SIZE_BYTES} bytes (5 MB)`
      ],
      code: "FILE_TOO_LARGE"
    };
  }

  return { valid: true, errors: [], code: null };
}

/**
 * Sanitize a filename: strip directory components and replace any character
 * that is not alphanumeric, dash, underscore, or dot with an underscore.
 *
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== "string") return "upload";
  // Strip any path component (handles both / and \)
  const base = filename.replace(/^.*[/\\]/, "");
  // Replace disallowed characters
  return base.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
}

/**
 * Derive the canonical file extension for a MIME type.
 *
 * @param {string} mimeType
 * @returns {string}  e.g. ".jpg"
 */
export function extensionForMime(mimeType) {
  return MIME_TO_EXTENSION[mimeType] || "";
}

/**
 * Build the storage filename: `<assetId><ext>`.
 * The original filename is stored separately in the asset record but is NOT
 * used as the on-disk name to prevent collisions and path-traversal risks.
 *
 * @param {{ assetId: string, mimeType: string }} params
 * @returns {string}
 */
export function buildStorageFilename({ assetId, mimeType }) {
  return `${assetId}${extensionForMime(mimeType)}`;
}

/**
 * Construct a MediaAsset record (pure data object, no DB write).
 *
 * @param {{
 *   assetId: string,
 *   eventId: string,
 *   organizerId: string,
 *   originalFilename: string,
 *   mimeType: string,
 *   sizeBytes: number,
 *   storagePath: string,
 *   publicUrl: string,
 *   createdAt: string
 * }} params
 * @returns {object}
 */
export function buildMediaAsset({
  assetId,
  eventId,
  organizerId,
  originalFilename,
  mimeType,
  sizeBytes,
  storagePath,
  publicUrl,
  createdAt
}) {
  return {
    assetId,
    eventId,
    organizerId,
    filename: sanitizeFilename(originalFilename),
    mimeType,
    sizeBytes,
    storagePath,
    publicUrl,
    createdAt
  };
}

export { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES };
