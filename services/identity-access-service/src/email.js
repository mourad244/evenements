import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Production / Configured SMTP
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Development Fallback: Just stream to logger
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true
  });
}

const transporter = createTransporter();

export async function sendPasswordResetEmail(email, token, log) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Event Platform" <noreply@eventplatform.local>',
    to: email,
    subject: "Reset your password",
    text: `You requested a password reset. Please click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `<p>You requested a password reset.</p><p>Please click the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.message && !process.env.SMTP_HOST) {
      // In fallback mode, log the email body so the developer can click the link
      log("info", "email.reset_password.fallback", {
        to: email,
        message: "SMTP not configured. Sent to stream.",
        content: info.message.toString()
      });
    } else {
      log("info", "email.reset_password.sent", {
        to: email,
        messageId: info.messageId
      });
    }
    return true;
  } catch (error) {
    log("error", "email.reset_password.failed", {
      to: email,
      error: error.message
    });
    return false;
  }
}
