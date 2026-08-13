import { emailLayout } from "./emailLayout";

interface MonitorRecoveryEmailProps {
  monitorName: string;
  monitorUrl: string;
}

export function monitorRecoveryEmail({
  monitorName,
  monitorUrl,
}: MonitorRecoveryEmailProps) {
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
      ● RECOVERED
    </div>

    <!-- Heading -->
    <h1 style="
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.25;
      letter-spacing: -0.7px;
      color: #171b20;
    ">
      ${monitorName} is back up
    </h1>

    <p style="
      margin: 0 0 28px;
      font-size: 15px;
      line-height: 1.7;
      color: #68717b;
    ">
      Good news — Monitorly detected that your monitor is responding
      successfully again.
    </p>

    <!-- Monitor details -->
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
          Monitor
        </div>

        <div style="
          font-size: 14px;
          font-weight: 600;
          color: #20252b;
        ">
          ${monitorName}
        </div>
      </div>

      <div>
        <div style="
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #8a929b;
          margin-bottom: 5px;
        ">
          URL
        </div>

        <div style="
          font-size: 14px;
          color: #3f4852;
          word-break: break-all;
        ">
          ${monitorUrl}
        </div>
      </div>

    </div>

    <!-- CTA -->
    <a
      href="${monitorUrl}"
      style="
        display: inline-block;
        padding: 12px 18px;
        background: #171b20;
        color: #ffffff;
        text-decoration: none;
        border-radius: 7px;
        font-size: 14px;
        font-weight: 600;
      "
    >
      Check monitor
    </a>

    <p style="
      margin: 24px 0 0;
      font-size: 13px;
      line-height: 1.6;
      color: #8a929b;
    ">
      Your monitor is healthy again. We'll continue monitoring it normally.
    </p>
  `;

  return emailLayout({
    content,
    accentColor: "#4ade80",
  });
}
