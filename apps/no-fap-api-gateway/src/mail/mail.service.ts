import { Inject, Injectable } from '@nestjs/common';
// import { CreateMailDto } from './dto/create-mail.dto';
// import { UpdateMailDto } from './dto/update-mail.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MailService {
  constructor(@Inject('MAIL_SERVICE') private mail: ClientProxy) {}

  // create(createMailDto: CreateMailDto) {
  //   return 'This action adds a new mail';
  // }

  sendMail() {
    this.mail.emit('mail.sendMail', {});
    return 'email sended';
  }

  sendWelcome() {
    this.mail.emit('mail.sendWelcome', {
      to: 'marouane.elmoujahid-etu@etu.univh2c.ma',
      name: 'Marouane El Moujahid',
    });
    return {
      message: 'send welcome',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} mail`;
  }

  // update(id: number, updateMailDto: UpdateMailDto) {
  //   return `This action updates a #${id} mail`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} mail`;
  // }
}
