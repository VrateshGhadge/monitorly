import { emailLayout } from "./emailLayout";

interface NotificationTestEmailProps {
  userEmail: string;
}

export function notificationTestEmail({
  userEmail,
}: NotificationTestEmailProps) {
  const content = `
    <!-- Status -->
    <div style="
      display: inline-block;
      padding: 6px 10px;
      background: #ecfdf5;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      color: #16a34a;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
      margin-bottom: 20px;
    ">
      ● EMAIL ENABLED
    </div>

    <!-- Heading -->
    <h1 style="
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.25;
      letter-spacing: -0.7px;
      color: #171b20;
    ">
      Email notifications are working
    </h1>

    <p style="
      margin: 0 0 28px;
      font-size: 15px;
      line-height: 1.7;
      color: #68717b;
    ">
      This is a test notification from Monitorly. Your email alerts are
      configured correctly and ready to receive monitor status changes.
    </p>

    <!-- Notification details -->
    <div style="
      background: #f7f8fa;
      border: 1px solid #e5e8eb;
      border-radius: 8px;
      padding: 18px 20px;
      margin-bottom: 28px;
    ">

      <div style="
        margin-bottom: 14px;
      ">
        <div style="
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #8a929b;
          margin-bottom: 5px;
        ">
          Notification email
        </div>

        <div style="
          font-size: 14px;
          font-weight: 600;
          color: #20252b;
          word-break: break-all;
        ">
          ${userEmail}
        </div>
      </div>

      <div style="
        font-size: 14px;
        color: #16a34a;
        font-weight: 600;
      ">
        ✓ Email delivery is configured
      </div>

    </div>

    <p style="
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      color: #8a929b;
    ">
      You can now receive alerts when your monitors go down or recover.
    </p>
  `;

  return emailLayout({
    content,
    accentColor: "#4ade80",
  });
}
