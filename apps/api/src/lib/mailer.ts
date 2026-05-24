import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Tasteful" <${user}>`;

  if (!host || !user || !pass) {
    console.warn('[Mailer] SMTP is not configured in .env (SMTP_HOST, SMTP_USER, SMTP_PASS are required).');
    console.warn(`[Mailer] Fallback: Verification code for ${to} is ${code}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tasteful Verification Code</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #030712;
            color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0c1021;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          }
          .header {
            background-color: #090d1a;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -1px;
            color: #ffffff;
            text-decoration: none;
          }
          .logo-highlight {
            color: #f59e0b;
          }
          .content {
            padding: 40px;
            text-align: center;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            margin-top: 0;
            margin-bottom: 20px;
            color: #ffffff;
          }
          p {
            font-size: 15px;
            line-height: 1.6;
            color: #9ca3af;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin: 30px auto;
            max-width: 280px;
            text-align: center;
          }
          .code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 900;
            color: #f59e0b;
            letter-spacing: 6px;
            margin: 0;
          }
          .footer {
            background-color: #090d1a;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #4b5563;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          .footer a {
            color: #f59e0b;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Taste<span class="logo-highlight">ful</span></span>
          </div>
          <div class="content">
            <h1>Verify your email address</h1>
            <p>Welcome to Tasteful! Please use the following one-time verification code to log in to your account. This code is valid for 5 minutes.</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; 2026 Tasteful. All rights reserved.<br>
            If you have any questions, please contact our support.
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from,
      to,
      subject: `Tasteful Verification Code: ${code}`,
      text: `Your Tasteful verification code is: ${code}. This code is valid for 5 minutes.`,
      html,
    });

    console.log(`[Mailer] Verification email successfully sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Mailer] Error sending verification email to ${to}:`, error);
    return false;
  }
}
