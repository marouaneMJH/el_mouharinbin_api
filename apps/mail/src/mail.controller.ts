import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IEmail, IEmailData } from 'libs/contract/interfaces/email.interface';
import { AccountActivationMailTDto } from '../../../libs/contract/payloads/mail-templates/account-activation.payload';
import { makeServicesHost } from 'ts-loader/dist/servicesHost';
import { mockPrismaService } from '../../users/src/__tests__/mocks/prisma.service.mock';
import { servicesPattern } from '../../../libs/contract/config/services-pattern';
@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('mail.sendMail')
  async sendMail(@Payload() emailData: IEmailData) {
    return await this.mailService.getRecord();
  }

  @EventPattern(servicesPattern.mail.welcome)
  sendWelcomeEmail(@Payload() emailData: { to: string; name: string }) {
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
  @EventPattern(servicesPattern.mail.activate)
  activationEmail(
    @Payload()
    emailData: AccountActivationMailTDto,
  ) {
    console.log('activationEmail', emailData);
    return this.mailService.sendEmailWithTemplate({
      email: {
        subject: 'Activate your Account',
        to: emailData.userEmail,
        content: '',
      },
      templateName: 'account-activation',
      context: emailData,
    });
  }
}
