// @ts-ignore
import { SMTPServer } from 'smtp-server';

// Placeholder for mock SMTP server for MFA/OTP
// In a real implementation, use a library like smtp-server for local testing
export function startMockSMTPServer() {
  const server = new SMTPServer({
    authOptional: true,
    onData(stream: any, session: any, callback: any) {
      let message = '';
      stream.on('data', (chunk: any) => {
        message += chunk;
      });
      stream.on('end', () => {
        console.log('Received email:', message);
        callback();
      });
    },
  });
  server.listen(1025, () => {
    console.log('Mock SMTP server started on port 1025');
  });
}
