import type { ISMSGateway, SMSResponse } from './index';

export class MSG91Gateway implements ISMSGateway {
  private apiKey: string;
  private senderId: string;
  private templateId: string;
  private baseUrl = 'https://api.msg91.com/api/v5';

  constructor() {
    this.apiKey = import.meta.env.VITE_MSG91_API_KEY || '';
    this.senderId = import.meta.env.VITE_MSG91_SENDER_ID || 'DMLTAC';
    this.templateId = import.meta.env.VITE_MSG91_TEMPLATE_ID || '';

    if (!this.apiKey) {
      throw new Error('MSG91 API key not configured. Set VITE_MSG91_API_KEY in .env file');
    }
  }

  getName(): string {
    return 'MSG91';
  }

  async sendOTP(phone: string, otp: string): Promise<SMSResponse> {
    try {
      const message = `Your OTP for DMLT Academy is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      const response = await fetch(`${this.baseUrl}/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.apiKey,
        },
        body: JSON.stringify({
          sender: this.senderId,
          short_url: '0',
          mobiles: phone,
          var1: otp,
          template_id: this.templateId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.type === 'success') {
        return {
          success: true,
          messageId: data.message_id || data.request_id,
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to send SMS via MSG91',
        errorCode: data.type,
      };
    } catch (error) {
      console.error('MSG91 SMS error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error while sending SMS',
      };
    }
  }
}
