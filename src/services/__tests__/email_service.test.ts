import { emailService } from '../email_service';

const emailOptions = {
  to: 'hi@hello.com',
  from: 'bye@seeya.com',
  templateId: '001',
  templateModel: {},
};

describe('Email Service', () => {
  const email = emailService.init({ apiKey: 'POSTMARK_API_TEST' });
  test('Config for single email', async() => {
    try {
      await email.send(emailOptions);
    } catch (error) {
      expect(error.code).toBe(1101);
    }
  });

  test('Config for multiple emails', async() => {
    try {
      await email.sendBatch([emailOptions, emailOptions]);
    } catch (error) {
      expect(error.map((x) => x.code)).toBe(expect.arrayContaining([1101, 1101]));
    }
  });
});
