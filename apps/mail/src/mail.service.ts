import { Injectable } from '@nestjs/common';
import { createMailTransporter } from './config/node-mailer.config';
import { IEmail } from 'libs/contract/interfaces/email.interface';

@Injectable()
export class MailService {
  async sendMail(email: IEmail) {
    console.log('the service');
    console.log('email: ', process.env.EMAIL_USER);
    console.log('password: ', process.env.EMAIL_PASSWORD);
    console.log('host: ', process.env.EMAIL_HOST);

    const mailTransporter = createMailTransporter();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const info = await mailTransporter.sendMail({
        to: email.to,
        subject: email.subject,
        html: email.content,
      });

      console.log(info);

      console.log(`email sended to ${email.to}`);
    } catch (error: any) {
      console.log(
        `error during sending the email to ${email.to} with the error ${error.message}`,
      );
    }
  }
}
