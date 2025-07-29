// apps/mail/src/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

const getTemplatePath = () => {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // Development: use source path - note the path structure
    return join(process.cwd(), 'apps/mail/src/templates');
  } else {
    // Production: templates will be copied to dist by nest-cli assets config
    return join(__dirname, 'templates');
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), 'apps/mail/.env'),
        join(process.cwd(), '.env'),
      ],
      cache: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('EMAIL_HOST'),
            port: 587,
            secure: false,
            auth: {
              user: configService.get('EMAIL_USER'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: `"${configService.get('MAIL_FROM_NAME') || 'No Fap API'}" <${configService.get('EMAIL_USER')}>`,
          },
          template: {
            dir: getTemplatePath(),
            adapter: new EjsAdapter({
              inlineCssEnabled: true,
            }),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
