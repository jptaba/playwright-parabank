"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestReportEmail = sendTestReportEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
// @ts-ignore
// Placeholder for sending email with report and screenshots
// In a real implementation, use nodemailer or similar library
async function sendTestReportEmail(reportPath, screenshots) {
    // Example using nodemailer (configure with your SMTP details)
    const transporter = nodemailer_1.default.createTransport({
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
