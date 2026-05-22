import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import fs from 'fs';
import { join } from 'path';
import { sharedEnvironment } from '../shared-environment';
import {
    MailerTemplateGreeting,
    MailerTemplateProperties,
    SendMailerConfig,
} from './com.model';
import Handlebars, { TemplateDelegate } from 'handlebars';
import { SettingsService } from '../settings';
import { Attachment } from 'nodemailer/lib/mailer';
import { Logger } from 'winston';

export class MailerService {
    private static instance: MailerService | null = null;
    private static _logger: Logger;
    private mailTransporter: Transporter;
    private settingsService = SettingsService.getInstance();

    private get logger(): Logger {
        if (!MailerService._logger) {
            throw new Error('Logger instance is not set');
        }

        return MailerService._logger;
    }

    private constructor() {
        const smtpConfig = sharedEnvironment().smtpConfig;
        const options: SMTPTransport.Options = smtpConfig
            ? JSON.parse(smtpConfig)
            : {};

        this.mailTransporter = nodemailer.createTransport(options);
    }

    public static getInstance(): MailerService {
        if (!MailerService.instance) {
            if (!MailerService._logger) {
                throw new Error(
                    'Logger instance is required for the first initialization',
                );
            }

            MailerService.instance = new MailerService();
        }

        return MailerService.instance;
    }

    public static setLogger(logger: Logger): void {
        MailerService._logger = logger;
    }

    public async sendGreetingEmail(
        to: string,
        subject: string,
        data: Omit<MailerTemplateGreeting, 'subject'>,
        attachments?: Attachment[],
    ): Promise<void> {
        const templateProperties = await this.getTemplateProperties();
        const templateData = {
            subject,
            ...templateProperties,
            ...data,
        };
        const htmlTemplate = await this.getHtmlTemplate<MailerTemplateGreeting>(
            'mailer-greeting-template',
        );
        const html = htmlTemplate(templateData);
        const textTemplate = await this.getTextTemplate<MailerTemplateGreeting>(
            'mailer-greeting-template',
        );
        const text = textTemplate(templateData);

        await this.sendEmail({
            to,
            subject,
            text,
            html,
            attachments,
        });
    }

    private async getHtmlTemplate<T = any>(
        templateName: string,
    ): Promise<TemplateDelegate<T & MailerTemplateProperties>> {
        const templatePath = join(
            __dirname,
            'templates',
            'html',
            `${templateName}.html`,
        );

        return await this.getTemplate(templatePath);
    }

    private async getTextTemplate<T = any>(
        templateName: string,
    ): Promise<TemplateDelegate<T & MailerTemplateProperties>> {
        const templatePath = join(
            __dirname,
            'templates',
            'text',
            `${templateName}.txt`,
        );

        return await this.getTemplate(templatePath);
    }

    private async getTemplate(templatePath: string): Promise<TemplateDelegate> {
        try {
            const templateSource = await fs.promises.readFile(
                templatePath,
                'utf-8',
            );
            const template = Handlebars.compile(templateSource);
            return template;
        } catch (error) {
            this.logger.error(
                `Error reading template '${templatePath}':`,
                error,
            );
            throw new Error(`Template '${templatePath}' not found`);
        }
    }

    private async getTemplateProperties(): Promise<MailerTemplateProperties> {
        const organizationName = (await this.settingsService.getSetting(
            'organizationName',
        )) as string;
        const cafeName = (await this.settingsService.getSetting(
            'cafeName',
        )) as string;

        return {
            senderName: `${organizationName} ${cafeName}`,
            organizationName: (await this.settingsService.getSetting(
                'organizationName',
            )) as string,
            organizationAddress: (await this.settingsService.getSetting(
                'organizationAddress',
            )) as string,
        };
    }

    private async sendEmail(config: SendMailerConfig): Promise<void> {
        try {
            const organizationName = (await this.settingsService.getSetting(
                'organizationName',
            )) as string;
            const cafeName = (await this.settingsService.getSetting(
                'cafeName',
            )) as string;
            const cafeEmail = (await this.settingsService.getSetting(
                'cafeEmail',
            )) as string;
            const from = `${organizationName} ${cafeName} <${cafeEmail}>`;
            const { to, subject, text, html, attachments } = config;

            await this.mailTransporter.sendMail({
                from,
                to,
                subject,
                text,
                html,
                attachments,
            });

            this.logger.info(
                `Email sent to ${config.to} with subject "${config.subject}"`,
            );
        } catch (error) {
            this.logger.error(`Error sending email to ${config.to}:`, error);
            throw new Error(`Failed to send email to ${config.to}`);
        }
    }
}
