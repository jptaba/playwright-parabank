import nodemailer from 'nodemailer';
// @ts-ignore

// Placeholder for sending email with report and screenshots
// In a real implementation, use nodemailer or similar library
export async function sendTestReportEmail(
  reportPath: string,
  screenshots: string[]
): Promise<void> {
  // Example using nodemailer (configure with your SMTP details)
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025, // Use mocksmtp or your SMTP server
    secure: false,
    auth: null,
  });

  const attachments = screenshots.map((file) => ({
    filename: file.split('/').pop(),
    path: file,
  }));

  await transporter.sendMail({
    from: 'test@parabank.com',
    to: 'recipient@example.com',
    subject: 'Playwright Test Report',
    text: 'See attached report and screenshots.',
    attachments: [
      { filename: 'report.html', path: reportPath },
      ...attachments,
    ],
  });
}
