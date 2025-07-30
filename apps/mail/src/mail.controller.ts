import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IEmail, IEmailData } from 'libs/contract/interfaces/email.interface';
@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('mail.sendWelcome')
  sendWelcomeEmail(@Payload() emailData: IEmail & { name: string }) {
    return this.mailService.sendWelcomeEmail(emailData.to, emailData.name);
  }

  @EventPattern('mail.sendEmailWithTemplate')
  sendEmailWithTemplate(
    @Payload()
    emailData: Omit<IEmailData, 'from'> & {
      from?: string;
    },
  ) {
    return this.mailService.sendEmailWithTemplate(emailData);
  }
}
