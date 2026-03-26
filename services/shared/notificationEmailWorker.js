const TEMPLATE_BY_EVENT = {
  "registration.confirmed": "EMAIL_REGISTRATION_CONFIRMED",
  "registration.waitlisted": "EMAIL_REGISTRATION_WAITLISTED",
  "registration.promoted": "EMAIL_REGISTRATION_PROMOTED",
  "event.cancelled": "EMAIL_EVENT_CANCELLED"
};

export function normalizeNotificationChannel(channel) {
  const normalized = String(channel || "").trim().toUpperCase();
  return normalized || "EMAIL";
}

export function resolveTemplateIdForEvent(eventName) {
  const normalizedEventName = String(eventName || "").trim();
  return TEMPLATE_BY_EVENT[normalizedEventName] || null;
}

export function buildNotificationDispatchRequests({
  event,
  recipientResolver = defaultRecipientResolver
} = {}) {
  const envelope = normalizeEventEnvelope(event);
  if (!envelope.ok) {
    return envelope;
  }

  if (envelope.data.eventName === "notification.email.requested") {
    return buildRequestedEmailDispatch(envelope.data);
  }

  const templateId = resolveTemplateIdForEvent(envelope.data.eventName);
  if (!templateId) {
    return reject(400, "UNSUPPORTED_NOTIFICATION_EVENT");
  }

  const resolvedRecipients = recipientResolver(envelope.data);
  const recipients = Array.isArray(resolvedRecipients)
    ? resolvedRecipients
    : resolvedRecipients
      ? [resolvedRecipients]
      : [];

  if (recipients.length === 0) {
    return reject(422, "RECIPIENT_RESOLUTION_FAILED");
  }

  const requests = recipients.map((recipient, index) =>
    buildDispatchRequest({
      envelope: envelope.data,
      templateId,
      recipient,
      sequence: index + 1
    })
  );

  return {
    ok: true,
    data: requests
  };
}

export function createNotificationEmailWorker({
  sendEmail,
  templateRenderer,
  processedMessageStore = new Set(),
  metricsEmitter = null,
  nowFn = () => new Date().toISOString()
} = {}) {
  if (typeof sendEmail !== "function") {
    throw new Error("sendEmail must be a function");
  }
  if (typeof templateRenderer !== "function") {
    throw new Error("templateRenderer must be a function");
  }

  return {
    async processEvent({ event, recipientResolver } = {}) {
      const built = buildNotificationDispatchRequests({
        event,
        recipientResolver
      });
      if (!built.ok) {
        return built;
      }

      const results = [];
      for (const dispatchRequest of built.data) {
        results.push(
          await processDispatchRequest({
            dispatchRequest,
            sendEmail,
            templateRenderer,
            processedMessageStore,
            metricsEmitter,
            nowFn
          })
        );
      }

      return {
        ok: true,
        statusCode: 200,
        data: results
      };
    },

    async processDispatchRequest({ dispatchRequest } = {}) {
      return processDispatchRequest({
        dispatchRequest,
        sendEmail,
        templateRenderer,
        processedMessageStore,
        metricsEmitter,
        nowFn
      });
    }
  };
}

async function processDispatchRequest({
  dispatchRequest,
  sendEmail,
  templateRenderer,
  processedMessageStore,
  metricsEmitter,
  nowFn
}) {
  const request = normalizeDispatchRequest(dispatchRequest);
  if (!request.ok) {
    return request;
  }

  const dedupeKey = request.data.messageId;
  if (processedMessageStore.has(dedupeKey)) {
    return {
      ok: true,
      statusCode: 200,
      duplicate: true,
      data: {
        notificationLog: buildNotificationLog({
          request: request.data,
          status: "SENT",
          nowFn,
          attemptNumber: 1
        })
      }
    };
  }

  const startedAt = Date.now();
  let rendered;
  try {
    rendered = await templateRenderer({
      templateId: request.data.templateId,
      context: request.data.context,
      channel: request.data.channel
    });
  } catch (error) {
    recordNotificationFailure(metricsEmitter, startedAt, "RENDER_ERROR");
    return {
      ok: false,
      statusCode: 422,
      error: {
        code: "TEMPLATE_RENDER_FAILED",
        message: error instanceof Error ? error.message : String(error)
      },
      data: {
        notificationLog: buildNotificationLog({
          request: request.data,
          status: "FAILED",
          nowFn,
          errorCode: "TEMPLATE_RENDER_FAILED",
          errorMessage: error instanceof Error ? error.message : String(error),
          attemptNumber: 1
        })
      }
    };
  }

  try {
    const providerResult = await sendEmail({
      to: request.data.recipientEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      correlationId: request.data.correlationId
    });

    processedMessageStore.add(dedupeKey);
    recordNotificationSuccess(metricsEmitter, startedAt);

    return {
      ok: true,
      statusCode: 200,
      duplicate: false,
      data: {
        providerMessageId: normalizeOptionalString(providerResult?.providerMessageId),
        notificationLog: buildNotificationLog({
          request: request.data,
          status: "SENT",
          nowFn,
          providerMessageId: normalizeOptionalString(
            providerResult?.providerMessageId
          ),
          attemptNumber: 1
        })
      }
    };
  } catch (error) {
    recordNotificationFailure(metricsEmitter, startedAt, "PROVIDER_ERROR");
    return {
      ok: false,
      statusCode: 502,
      error: {
        code: "NOTIFICATION_SEND_FAILED",
        message: error instanceof Error ? error.message : String(error)
      },
      data: {
        notificationLog: buildNotificationLog({
          request: request.data,
          status: "FAILED",
          nowFn,
          errorCode: "NOTIFICATION_SEND_FAILED",
          errorMessage: error instanceof Error ? error.message : String(error),
          attemptNumber: 1
        })
      }
    };
  }
}

function buildRequestedEmailDispatch(envelope) {
  const templateId = normalizeOptionalString(envelope.data?.templateId);
  const recipientUserId = normalizeOptionalString(envelope.data?.recipientUserId);
  const context = envelope.data?.context;

  if (!templateId || !recipientUserId || !context || typeof context !== "object") {
    return reject(422, "INVALID_NOTIFICATION_REQUESTED_EVENT");
  }

  const recipientEmail =
    normalizeOptionalString(envelope.data?.recipientEmail) ||
    normalizeOptionalString(context.recipientEmail);

  if (!recipientEmail) {
    return reject(422, "RECIPIENT_RESOLUTION_FAILED");
  }

  return {
    ok: true,
    data: [
      {
        messageId: envelope.messageId,
        templateId,
        channel: "EMAIL",
        recipientUserId,
        recipientEmail,
        correlationId: envelope.correlationId,
        context
      }
    ]
  };
}

function buildDispatchRequest({ envelope, templateId, recipient, sequence }) {
  const recipientUserId =
    normalizeOptionalString(recipient?.recipientUserId) ||
    normalizeOptionalString(recipient?.participantId) ||
    normalizeOptionalString(envelope.data?.participantId);
  const recipientEmail =
    normalizeOptionalString(recipient?.recipientEmail) ||
    normalizeOptionalString(envelope.data?.recipientEmail);

  return {
    messageId:
      sequence > 1
        ? `${envelope.messageId}:${sequence}`
        : envelope.messageId,
    templateId,
    channel: "EMAIL",
    recipientUserId,
    recipientEmail,
    correlationId: envelope.correlationId,
    context: {
      ...envelope.data,
      recipientUserId,
      recipientEmail
    }
  };
}

function buildNotificationLog({
  request,
  status,
  nowFn,
  errorCode = null,
  errorMessage = null,
  providerMessageId = null,
  attemptNumber = 1
}) {
  return {
    notificationId: `notif_${request.messageId}`,
    messageId: request.messageId,
    templateId: request.templateId,
    channel: request.channel,
    recipientUserId: request.recipientUserId,
    eventId: normalizeOptionalString(request.context?.eventId),
    registrationId: normalizeOptionalString(request.context?.registrationId),
    status,
    errorCode: normalizeOptionalString(errorCode),
    errorMessage: normalizeOptionalString(errorMessage),
    providerMessageId: normalizeOptionalString(providerMessageId),
    attemptNumber,
    processedAt: nowFn(),
    correlationId: request.correlationId
  };
}

function normalizeEventEnvelope(event) {
  const messageId = normalizeOptionalString(event?.messageId);
  const eventName = normalizeOptionalString(event?.eventName);
  const correlationId = normalizeOptionalString(event?.correlationId);
  const data = event?.data;

  if (!messageId || !eventName || !correlationId || !data || typeof data !== "object") {
    return reject(422, "INVALID_NOTIFICATION_EVENT");
  }

  return {
    ok: true,
    data: {
      messageId,
      eventName,
      correlationId,
      data
    }
  };
}

function normalizeDispatchRequest(request) {
  const messageId = normalizeOptionalString(request?.messageId);
  const templateId = normalizeOptionalString(request?.templateId);
  const channel = normalizeNotificationChannel(request?.channel);
  const recipientUserId = normalizeOptionalString(request?.recipientUserId);
  const recipientEmail = normalizeOptionalString(request?.recipientEmail);
  const correlationId = normalizeOptionalString(request?.correlationId);
  const context = request?.context;

  if (
    !messageId ||
    !templateId ||
    !recipientUserId ||
    !recipientEmail ||
    !correlationId ||
    !context ||
    typeof context !== "object"
  ) {
    return reject(422, "INVALID_DISPATCH_REQUEST");
  }

  return {
    ok: true,
    data: {
      messageId,
      templateId,
      channel,
      recipientUserId,
      recipientEmail,
      correlationId,
      context
    }
  };
}

function defaultRecipientResolver(envelope) {
  if (envelope.eventName === "event.cancelled") {
    return Array.isArray(envelope.data?.recipients) ? envelope.data.recipients : [];
  }

  return {
    recipientUserId:
      normalizeOptionalString(envelope.data?.recipientUserId) ||
      normalizeOptionalString(envelope.data?.participantId),
    recipientEmail: normalizeOptionalString(envelope.data?.recipientEmail)
  };
}

function recordNotificationSuccess(metricsEmitter, startedAt) {
  if (!metricsEmitter?.recordNotificationSend) {
    return;
  }
  metricsEmitter.recordNotificationSend({
    channel: "EMAIL",
    status: "SENT",
    durationMs: Date.now() - startedAt
  });
}

function recordNotificationFailure(metricsEmitter, startedAt, errorClass) {
  if (!metricsEmitter?.recordNotificationSend) {
    return;
  }
  metricsEmitter.recordNotificationSend({
    channel: "EMAIL",
    status: "FAILED",
    durationMs: Date.now() - startedAt,
    errorClass
  });
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function reject(statusCode, code, extra = {}) {
  return {
    ok: false,
    statusCode,
    error: {
      code,
      ...extra
    }
  };
}
