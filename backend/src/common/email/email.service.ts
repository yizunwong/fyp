import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly fromAddress: string;

  constructor() {
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION is required for SES');
    }
    if (!process.env.SES_FROM_ADDRESS) {
      throw new Error('SES_FROM_ADDRESS is required for SES');
    }

    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
    });

    this.fromAddress = process.env.SES_FROM_ADDRESS;
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string,
  ): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: this.fromAddress,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: htmlBody,
            },
            ...(textBody
              ? {
                  Text: {
                    Data: textBody,
                  },
                }
              : {}),
          },
        },
      });

      await this.sesClient.send(command);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send email',
        (error as Error).message,
      );
    }
  }
}
