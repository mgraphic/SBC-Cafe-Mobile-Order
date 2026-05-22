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
