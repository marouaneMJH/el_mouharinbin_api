import Mail from 'nodemailer/lib/mailer';

interface IEmail {
  to: string;
  subject: string;
  content: string;
  attachments?: Mail.Attachment[];
}

interface IEmailData {
  email: IEmail;
  context?: any;
  templateName?: string;
  from?: string;
}

export { IEmail, IEmailData };
export default IEmail;
