import { Resend } from "resend";
import { monitorDownEmail } from "../templates/email/monitorDown";
import { monitorRecoveryEmail } from "../templates/email/monitorRecovery";
import { notificationTestEmail } from "../templates/email/notificationTest";

export async function sendTestEmail(
  env: CloudflareBindings,
  userEmail: string,
) {
  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Monitorly <alerts@updates.monitorly.live>",
    to: userEmail,
    subject: "Monitorly Test Email",
    // html: `<h1>Monitorly</h1><p>Your email integration is working!</p>`,
    html: notificationTestEmail({
      userEmail,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendMonitorDownEmail(
  env: CloudflareBindings,
  userEmail: string,
  monitorName: string,
  monitorUrl: string,
) {
  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Monitorly <alerts@updates.monitorly.live>",
    to: userEmail,
    subject: `${monitorName} is DOWN`,
    // html: `
    //   <h1>🚨 Monitorly</h1>
    //   <p>
    //     The monitor <strong>${monitorName}</strong>
    //     (${monitorUrl}) is currently <strong>DOWN</strong>.
    //   </p>
    // `,
    html: monitorDownEmail({
      monitorName,
      monitorUrl,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendMonitorRecoveryEmail(
  env: CloudflareBindings,
  userEmail: string,
  monitorName: string,
  monitorUrl: string,
) {
  const resend = new Resend(env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "Monitorly <alerts@updates.monitorly.live>",
    to: userEmail,
    // subject: `${monitorName} is RECOVERED`,
    subject: `${monitorName} is back up`,
    // html: `
    //   <h1>✅ Monitorly</h1>
    //   <p>
    //     The monitor <strong>${monitorName}</strong>
    //     (${monitorUrl}) has been <strong>RECOVERED</strong>.
    //   </p>
    // `,
    html: monitorRecoveryEmail({
      monitorName,
      monitorUrl,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
