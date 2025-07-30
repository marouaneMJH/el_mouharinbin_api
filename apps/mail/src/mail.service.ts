/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { IEmailData } from 'libs/contract/interfaces/email.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private async sendMailUtils(emailData: IEmailData) {
    const result = await this.mailerService.sendMail({
      to: emailData.email.to,
      from: emailData.from ?? process.env.EMAIL_USER,
      subject: emailData.email.subject,
      template: emailData.templateName,
      context: emailData.context,
      attachments: emailData.email.attachments,
    });
    this.logger.log(
      `[+] Email [${emailData.templateName ?? 'blank'}]] send with success to ${emailData.email.to}.`,
    );
    return { success: true, messageId: result.messageId };
  }

  private async sendEmail(emailData: IEmailData) {
    try {
      return await this.sendMailUtils(emailData);
    } catch {
      this.logger.log(
        `[?] Email [${emailData.templateName ?? 'blank'}]] not send to ${emailData.email.to}, trying the fallback email.`,
      );
      try {
        return { ...(await this.sendMailUtils(emailData)), fallback: true };
      } catch (error: any) {
        this.logger.log(
          `[?] Fallback email [${emailData.templateName ?? 'blank'}] not send to ${emailData.email.to}, ${error.message}.`,
        );
      }
    }
  }

  async sendWelcomeEmail(to: string, name?: string, email?: string) {
    const emailData: IEmailData = {
      email: {
        to,
        content: '',
        subject: 'Welcome to MOHARIBIN APP',
      },
      templateName: 'welcoming',
      context: {
        name,
        email,
      },
    };

    return await this.sendEmail(emailData);
  }

  async sendEmailWithTemplate(
    emailData: Omit<IEmailData, 'from'> & { from?: string },
  ) {
    return this.sendEmail(emailData);
  }
}
