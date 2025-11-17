import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailEnabled = this.configService.get<string>('EMAIL_ENABLED', 'false') === 'true';

    if (!emailEnabled) {
      this.logger.warn('Email service is disabled. Set EMAIL_ENABLED=true to enable.');
      return;
    }

    const host = this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('EMAIL_PORT', 587);
    const secure = this.configService.get<string>('EMAIL_SECURE', 'false') === 'true';
    const user = this.configService.get<string>('EMAIL_USER');
    const password = this.configService.get<string>('EMAIL_PASSWORD');

    if (!user || !password) {
      this.logger.error('Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });

    this.logger.log('Email service initialized');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Email not sent.', {
        to: options.to,
        subject: options.subject,
      });
      return;
    }

    try {
      const from = this.configService.get<string>(
        'EMAIL_FROM',
        this.configService.get<string>('EMAIL_USER', 'noreply@org.com')
      );

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });

      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetUrl?: string
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const resetLink = resetUrl || `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to reset it:</p>
            <p style="margin: 20px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
