export function emailLayout({
  content,
  accentColor = "#4ade80",
}: {
  content: string;
  accentColor?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Monitorly</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  color: #161a1d;
">

  <div style="
    width: 100%;
    padding: 40px 16px;
    box-sizing: border-box;
  ">

    <div style="
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e6ea;
      border-radius: 12px;
      overflow: hidden;
    ">

      <!-- Header -->
      <div style="
        padding: 24px 28px;
        border-bottom: 1px solid #e8ebee;
      ">
        <div style="
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.4px;
        ">
          <span style="
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 2px solid ${accentColor};
            border-radius: 3px;
            margin-right: 8px;
            vertical-align: 1px;
          "></span>
          monitorly
        </div>
      </div>

      <!-- Content -->
      <div style="
        padding: 32px 28px;
      ">
        ${content}
      </div>

      <!-- Footer -->
      <div style="
        padding: 20px 28px;
        border-top: 1px solid #e8ebee;
        background: #fafbfc;
        color: #7b838c;
        font-size: 12px;
        line-height: 1.6;
      ">
        <div style="
          font-weight: 600;
          color: #505861;
          margin-bottom: 4px;
        ">
          Monitorly
        </div>

        <div>
          Website and API monitoring made simple.
        </div>

        <div style="
          margin-top: 12px;
          color: #9aa1a9;
        ">
          You're receiving this email because email alerts are enabled
          for your Monitorly account.
        </div>
      </div>

    </div>

  </div>

</body>
</html>
`;
}
