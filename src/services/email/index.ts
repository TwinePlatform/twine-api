import * as Postmark from 'postmark';
import { EmailTemplate } from './templates';

type Attachment = {
  name: string,
  content: string,
  contentType: string,
};

type Email = {
  from: string,
  to: string,
  templateId: EmailTemplate,
  templateModel?: object,
  attachments?: Attachment[],
};

type EmailServiceConfig = {
  apiKey: string,
};

export type EmailService = {
  send: (emailOptions: Email) => Promise <Postmark.SendStatus>,
  sendBatch: (emailOptions: Email []) => Promise <Postmark.SendStatus[]>,
};

type EmailInitialiser = {
  init: (config: EmailServiceConfig) => EmailService,
};

const emailKeyMap = (a: Email): Postmark.PostmarkMessageWithTemplate => ({
  To: a.to,
  From: a.from,
  TemplateId: a.templateId,
  TemplateModel: a.templateModel,
  Attachments: (a.attachments || [])
    .map((a) => ({ Name: a.name, Content: a.content, ContentType: a.contentType })),
});

const emailInitialiser: EmailInitialiser = {
  init: (config: EmailServiceConfig) => {
    const emailClient = new Postmark.Client(config.apiKey);

    return {
      send: async (emailOptions: Email) => {
        const postmarkOptions: Postmark.PostmarkMessageWithTemplate = emailKeyMap(emailOptions);

        return emailClient.sendEmailWithTemplate(postmarkOptions);
      },
      sendBatch: async (emails: Email []) => {
        const postmarkEmails: Postmark.PostmarkMessageWithTemplate[] = emails.map(emailKeyMap);

        return emailClient.sendEmailBatchWithTemplates(postmarkEmails);
      },
    };
  },
};

export { emailInitialiser };
