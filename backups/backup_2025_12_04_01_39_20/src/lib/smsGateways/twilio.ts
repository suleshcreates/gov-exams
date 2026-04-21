import type { ISMSGateway, SMSResponse } from './index';

export class TwilioGateway implements ISMSGateway {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private baseUrl: string;

  constructor() {
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.fromNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER || '';

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      throw new Error('Twilio credentials not configured. Set VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, and VITE_TWILIO_PHONE_NUMBER in .env file');
    }

    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
  }

  getName(): string {
    return 'Twilio';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for DMLT Academy is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(`${this.baseUrl}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: this.fromNumber,
          Body: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid,
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to send SMS via Twilio',
        errorCode: data.code?.toString(),
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error while sending SMS',
      };
    }
  }
}
