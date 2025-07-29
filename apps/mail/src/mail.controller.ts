import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern } from '@nestjs/microservices';
import { IEmail } from 'libs/contract/interfaces/email.interface';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  private email: IEmail = {
    to: 'marwanmoujahid008@gmail.com',
    subject: 'test nodemailer',
    content: '<h1>hello evry times and evry second</h1> <p>same in same </p>',
  };

  @EventPattern('mail.sendMail')
  async sendMail() {
    return await this.mailService.sendMail(this.email);
  }
}
