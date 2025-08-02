import { Inject, Injectable } from '@nestjs/common';
// import { CreateMailDto } from './dto/create-mail.dto';
// import { UpdateMailDto } from './dto/update-mail.dto';
import { ClientProxy } from '@nestjs/microservices';
import IEmail from 'libs/contract/interfaces/email.interface';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(@Inject('MAIL_SERVICE') private mail: ClientProxy) {}

  // create(createMailDto: CreateMailDto) {
  //   return 'This action adds a new mail';
  // }

  sendMail() {
    const info = this.mail.emit('mail.sendMail', {
      to: 'marouane.elmoujahid-etu@etu.univh2c.ma',
      subject: 'send test',
      content: 'TEST',
    });
    return {
      message: 'email sended',
      info,
    };
  }

  sendWelcome() {
    const info = this.mail.emit('mail.sendWelcome', {
      to: 'marouane.elmoujahid-etu@etu.univh2c.ma',
      name: 'Marouane El Moujahid',
    });
    return {
      message: 'send welcome',
      info,
    };
  }
  sendEmailWithTemplate() {
    const info = this.mail.emit('mail.sendEmailWithTemplate', {
      email: {
        to: 'marouane.elmoujahid-etu@etu.univh2c.ma',
        subject: 'Welcome',
        attachments: [
          {
            filename: 'hello',
            path: path.resolve(
              process.cwd(),
              'apps/mail/src/attachments/text.txt',
            ),
          },
        ],

        // attachments:
      } as IEmail,

      templateName: 'test.ejs',
      context: {
        name: 'Marouane El  Moujahid',
      },
    });
    return {
      message: 'send welcome',
      info,
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} mail`;
  // }

  // update(id: number, updateMailDto: UpdateMailDto) {
  //   return `This action updates a #${id} mail`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} mail`;
  // }
}
