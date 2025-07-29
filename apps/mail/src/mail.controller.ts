import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IEmail } from 'libs/contract/interfaces/email.interface';
@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('mail.sendMail')
  sendMail(@Payload() emailData: IEmail) {
    return this.mailService.sendMail(emailData);
  }

  @EventPattern('mail.sendWelcome')
  sendWelcomeEmail(@Payload() emailData: IEmail & { name: string }) {
    return this.mailService.sendWelcomeEmail(emailData.to, emailData.name);
  }
}
