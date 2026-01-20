import type { ISMSGateway, SMSResponse } from './index';

export class TextLocalGateway implements ISMSGateway {
  private apiKey: string;
  private sender: string;
  private baseUrl = 'https://api.textlocal.in';

  constructor() {
    this.apiKey = import.meta.env.VITE_TEXTLOCAL_API_KEY || '';
    this.sender = import.meta.env.VITE_TEXTLOCAL_SENDER || 'GOVEXM';

    if (!this.apiKey) {
      throw new Error('TextLocal API key not configured. Set VITE_TEXTLOCAL_API_KEY in .env file');
    }
  }

  getName(): string {
    return 'TextLocal';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for GovExams is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const response = await fetch(`${this.baseUrl}/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          apikey: this.apiKey,
          numbers: phone,
          message: message,
          sender: this.sender,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      }

      return {
        success: false,
        error: data.errors?.[0]?.message || 'Failed to send SMS via TextLocal',
        errorCode: data.errors?.[0]?.code?.toString(),
      };
    } catch (error) {
      console.error('TextLocal SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error while sending SMS',
      };
    }
  }
}
