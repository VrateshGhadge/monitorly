import { Resend } from "resend";

export async function sendTestEmail(
  env: CloudflareBindings,
  userEmail: string
) {
  const resend = new Resend(env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "Monitorly <onboarding@resend.dev>",
    to: userEmail,
    subject: "Monitorly Test Email",
    html: `<h1>Monitorly</h1><p>Your email integration is working!</p>`,
  });

  return result;
}

export async function sendMonitorDownEmail(
  env: CloudflareBindings,
  userEmail: string,
  monitorName: string,
  monitorUrl: string
) {

  const resend = new Resend(env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "Monitorly <onboarding@resend.dev>",
    to: userEmail,
    subject: `${monitorName} is DOWN`,
    html: `
      <h1>🚨 Monitorly</h1>
      <p>
        The monitor <strong>${monitorName}</strong>
        (${monitorUrl}) is currently <strong>DOWN</strong>.
      </p>
    `,
  });

  return result;
}

export async function sendMonitorRecoveryEmail(
  env: CloudflareBindings,
  userEmail: string,
  monitorName: string,
  monitorUrl: string
) {

  const resend = new Resend(env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "Monitorly <onboarding@resend.dev>",
    to: userEmail,
    subject: `${monitorName} is RECOVERED`,
    html: `
      <h1>✅ Monitorly</h1>
      <p>
        The monitor <strong>${monitorName}</strong>
        (${monitorUrl}) has been <strong>RECOVERED</strong>.
      </p>
    `,
  });

  return result;
}