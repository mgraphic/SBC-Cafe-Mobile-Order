import { Attachment } from 'nodemailer/lib/mailer';

export interface SmsMessageRequest {
    sender: string;
    recipient: string;
    content: string;
    type?: string;
    tag?: string;
    webUrl?: string;
    unicodeEnabled?: boolean;
    organisationPrefix?: string;
}

export type SmsMessage = Omit<
    SmsMessageRequest,
    'sender' | 'organisationPrefix'
>;

export interface SmsMessageResponse {
    messageId: number;
}

export type MailerTemplateGreeting = {
    subject: string;
    header: string;
    name: string;
    message: string;
    showButton: boolean;
    buttonUrl?: string;
    buttonText?: string;
};

export type MailerTemplateOrderConfirmation = {
    subject: string;
    customerName: string;
    orderNumber: string;
    paymentStatus: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        imageUrl?: string;
    }>;
    totalAmount: number;
    orderUrl?: string;
};

export type MailerTemplateOtp = {
    subject: string;
    recipientName?: string;
    otp: string;
    validityMinutes: number;
};

export interface MailerTemplateProperties {
    senderName: string;
    organizationName: string;
    organizationAddress: string;
}

export interface SendMailerConfig {
    to: string;
    subject: string;
    text: string;
    html: string;
    attachments?: Attachment[];
}
