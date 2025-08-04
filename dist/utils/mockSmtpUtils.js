"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMockSMTPServer = startMockSMTPServer;
// @ts-ignore
const smtp_server_1 = require("smtp-server");
// Placeholder for mock SMTP server for MFA/OTP
// In a real implementation, use a library like smtp-server for local testing
function startMockSMTPServer() {
    const server = new smtp_server_1.SMTPServer({
        authOptional: true,
        onData(stream, session, callback) {
            let message = '';
            stream.on('data', (chunk) => {
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
