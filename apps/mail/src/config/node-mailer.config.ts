import * as nodemailer from 'nodemailer';

export const createMailTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST as string,
    port: 587, // Add explicit port
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });
