import nodemailer from "nodemailer";

/**
 * Read the mail configuration from an env-like object.
 * PURE — pass `process.env` (or any plain object) in.
 * @returns {{to: string, from: string, token: string} | null}
 *   the config when all three vars are present & non-empty, else null.
 */
export function mailConfigFromEnv(env) {
  const to = env.FR_COVERAGE_MAIL_TO;
  const from = env.FR_COVERAGE_MAIL_FROM;
  const token = env.FR_COVERAGE_MAIL_TOKEN;
  if (!to || !from || !token) return null;
  return { to, from, token };
}

/**
 * Build the plain-text coverage report email.
 * PURE — no I/O.
 * @param {{entityType: string, id: string, field: string, englishRef: string}[]} gaps
 * @param {{from: string, to: string}} config
 * @returns {{from: string, to: string, subject: string, text: string}}
 */
export function composeCoverageMail(gaps, { from, to }) {
  const subject = `❌ My Pokédex build blocked — ${gaps.length} unfilled French field(s)`;

  const byType = gaps.reduce((acc, g) => ((acc[g.entityType] ??= []).push(g), acc), {});
  const sections = Object.entries(byType).map(([type, list]) => {
    const lines = list.map((g) => `  ${g.id}.${g.field}  ← EN: ${g.englishRef}`);
    return `${type} (${list.length}):\n${lines.join("\n")}`;
  });

  const text = [
    `The French coverage check found ${gaps.length} unfilled field(s), so the build was blocked.`,
    "",
    sections.join("\n\n"),
    "",
    'Fill every "__STUB__ " entry in locales/fr-overrides.json, then rebuild.',
  ].join("\n");

  return { from, to, subject, text };
}

/**
 * Send the coverage email over Gmail SMTP.
 * Thin wrapper — not unit-tested (no real SMTP in tests).
 * @param {{from: string, to: string, subject: string, text: string}} message
 * @param {string} token Gmail App Password (SMTP auth pass).
 * @returns {Promise<unknown>} the Nodemailer send result.
 */
export async function sendCoverageMail(message, token) {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: message.from, pass: token },
  });
  return transport.sendMail(message);
}
