import { MSG91Gateway } from './msg91';
import { TwilioGateway } from './twilio';
import { TextLocalGateway } from './textlocal';

export interface SMSGatewayConfig {
  apiKey: string;
  senderId?: string;
  templateId?: string;
  [key: string]: any;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

export interface ISMSGateway {
  sendOTP(phone: string, otp: string): Promise<SMSResponse>;
  getName(): string;
}

/**
 * Factory function to create SMS gateway instance based on provider
 */
export const createSMSGateway = (provider: string): ISMSGateway => {
  const providerLower = provider.toLowerCase();
  
  switch (providerLower) {
    case 'msg91':
      return new MSG91Gateway();
    case 'twilio':
      return new TwilioGateway();
    case 'textlocal':
      return new TextLocalGateway();
    default:
      throw new Error(`Unsupported SMS provider: ${provider}. Supported providers: msg91, twilio, textlocal`);
  }
};
