import { SettingsService } from '../settings/settings.service';
import { sharedEnvironment } from '../shared-environment';
import { SmsMessage, SmsMessageRequest, SmsMessageResponse } from './com.model';

export class SmsService {
    private settingsService = SettingsService.getInstance();

    public async sendMessage(message: SmsMessage): Promise<SmsMessageResponse> {
        const sender = await this.settingsService.getSetting('cafeName');
        const organisationPrefix =
            (await this.settingsService.getSetting('organizationName')) ??
            undefined;
        const baseUrl = sharedEnvironment().brevo.baseUrl;
        const path = sharedEnvironment().brevo.paths.transactionalSMS;
        const apiKey = sharedEnvironment().brevo.apiKey;
        const { recipient, content, type, tag, webUrl, unicodeEnabled } =
            message;

        const response: Response = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify({
                sender,
                recipient,
                content,
                type,
                tag,
                webUrl,
                unicodeEnabled,
                organisationPrefix,
            }),
        });

        const responseData: SmsMessageResponse = await response.json();
        return responseData;
    }
}
