/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { IEmail } from 'libs/contract/interfaces/email.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(email: IEmail) {
    try {
      // Send basic HTML email
      const sendResult = await this.mailerService.sendMail({
        to: email.to,
        from: process.env.EMAIL_USER || 'marwanmojahid007@gmail.com',
        subject: email.subject,
        html: email.content,
      });

      this.logger.log(`Email sended with success to ${email.to}`);
      return {
        success: true,
        messageId: sendResult.messageId,
        fallback: false,
      };
    } catch (error: any) {
      this.logger.error(`Error sending email to ${email.to}:`, error.message);
      try {
        // Send basic HTML email
        const sendResult = await this.mailerService.sendMail({
          to: email.to,
          from: process.env.EMAIL_USER || 'marwanmojahid007@gmail.com',
          subject: email.subject,
          html: email.content,
        });

        this.logger.log(`Fallback Email sended with success to ${email.to}`);
        return {
          success: true,
          messageId: sendResult.messageId,
          fallback: true,
        };
      } catch (error: any) {
        this.logger.error(
          `Error sending fallback email to ${email.to}:`,
          error.message,
        );
        throw error;
      }
      //
    }
  }

  async sendWelcomeEmail(to: string, name?: string, email?: string) {
    this.logger.log(`Sending welcome email to ${to}`);

    try {
      const result = await this.mailerService.sendMail({
        to,
        from: process.env.EMAIL_USER || 'marwanmojahid007@gmail.com',
        subject: 'Welcome to No Fap API! 🚀',
        template: 'welcoming', // This will look for welcoming.ejs
        context: {
          name: name || 'Friend',
          email: email || to,
        },
      });

      this.logger.log(`Welcome email sent successfully to ${to}`);
      this.logger.log('Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      this.logger.error(`Error sending welcome email to ${to}:`, error.message);

      // Fallback to basic HTML email if template fails
      this.logger.log('Attempting fallback HTML email...');
      try {
        const fallbackResult = await this.mailerService.sendMail({
          to,
          from: process.env.EMAIL_USER || 'marwanmojahid007@gmail.com',
          subject: 'Welcome to ELMOHARIBIN',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4f46e5;">Welcome ${name || 'Friend'}!</h1>
              <p>Thank you for joining No Fap API. We're excited to have you on board!</p>
              <p>Best regards,<br>The No Fap API Team</p>
            </div>
          `,
        });

        this.logger.log('Fallback email sent successfully');
        return {
          success: true,
          messageId: fallbackResult.messageId,
          fallback: true,
        };
      } catch (fallbackError: any) {
        this.logger.error('Fallback email also failed:', fallbackError.message);
        throw error; // Throw original error
      }
    }
  }
}
