import { DatasourceError } from '@core/error';
import { Resend } from 'resend';
import { Inject, Service } from 'typedi';
import { RESEND_API_KEY } from './email.config';

@Service()
export class EmailService {
  private readonly resend: Resend;
  constructor(
    @Inject(RESEND_API_KEY) private readonly apiKey: string,
  ) {
    this.resend = new Resend(this.apiKey);
  }

  async sendEmail(user: string, email: string, password: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: `Here's the password of your new account!`,
      html: `<h1>Congratulations, ${user}, your new account is registered!</h1><br><p>Your account password is: ${password}.</p>`,
    });

    if (error) {
      throw new DatasourceError('Internal server error', {
        field: 'server',
        reason: 'Error derived from server',
      });
    }
  }
}
