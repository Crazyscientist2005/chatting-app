import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY || "re_placeholder_123456789";
const resend = new Resend(apiKey);

/**
 * Send a simple welcome email using Resend.
 * @param {string} to - Recipient email address.
 * @param {string} name - Recipient name (optional, used in template).
 */
export const sendWelcomeEmail = async (to, name = "") => {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("dummy")) {
    console.log(`[Email Skipped] Resend API key not set. Welcome email for ${to} omitted.`);
    return;
  }
  const html = `<p>Hello ${name || "User"},</p><p>Welcome to our chat app! 🎉</p>`;
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: "Welcome to the Chat App",
      html,
    });
    console.log("Welcome email sent to", to);
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
  }
};
