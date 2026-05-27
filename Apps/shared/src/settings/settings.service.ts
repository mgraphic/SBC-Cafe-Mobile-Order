import { Logger } from 'winston';
import { DynamoDbService } from '../aws';
import {
    CachedSetting,
    Setting,
    settingsTypeValues,
    SettingType,
    SettingTypeValue,
} from './settings.model';

export class SettingsService {
    private static readonly CACHE_DURATION = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
    private static readonly TABLE_NAME = 'SiteSettings';
    private static instance: SettingsService;
    private static _logger: Logger;

    private readonly cachedSettings: Record<string, CachedSetting> = {};
    private readonly cachedGroups: Record<
        string,
        { value: Record<string, SettingType>; timestamp: number }
    > = {};

    private get logger(): Logger {
        if (!SettingsService._logger) {
            throw new Error('Logger instance is not set');
        }

        return SettingsService._logger;
    }

    private constructor() {}

    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            if (!SettingsService._logger) {
                throw new Error(
                    'Logger instance is required for the first initialization',
                );
            }

            SettingsService.instance = new SettingsService();
        }

        return SettingsService.instance;
    }

    public static setLogger(logger: Logger): void {
        SettingsService._logger = logger;
    }

    private isCacheExpired(timestamp: number): boolean {
        return Date.now() - timestamp > SettingsService.CACHE_DURATION;
    }

    public async getSetting(key: string): Promise<SettingType> {
        if (
            key in this.cachedSettings &&
            !this.isCacheExpired(this.cachedSettings[key].timestamp)
        ) {
            return this.cachedSettings[key].value;
        }

        const setting = await DynamoDbService.getInstance().getItem<Setting>(
            SettingsService.TABLE_NAME,
            { key: { operation: '=', value: key } },
        );

        const result =
            setting?.length > 0
                ? this.castType(setting[0].type, setting[0].value)
                : null;

        if (result !== null) {
            this.cachedSettings[key] = { value: result, timestamp: Date.now() };
        }

        return result;
    }

    public async getGroupSettings(
        group: string,
    ): Promise<Record<string, SettingType>> {
        // Check if group is cached and not expired
        if (
            group in this.cachedGroups &&
            !this.isCacheExpired(this.cachedGroups[group].timestamp)
        ) {
            const groupResult = { ...this.cachedGroups[group].value };
            const groupTimestamp = this.cachedGroups[group].timestamp;

            // Replace with newer individual cached settings
            for (const key in groupResult) {
                if (
                    key in this.cachedSettings &&
                    this.cachedSettings[key].timestamp > groupTimestamp &&
                    !this.isCacheExpired(this.cachedSettings[key].timestamp)
                ) {
                    groupResult[key] = this.cachedSettings[key].value;
                }
            }

            return groupResult;
        }

        const settings = await DynamoDbService.getInstance().getItem<Setting>(
            SettingsService.TABLE_NAME,
            { group: { operation: '=', value: group } },
            'GroupIndex',
        );

        const result = settings.reduce(
            (acc, setting) => ({
                ...acc,
                [setting.key]: this.castType(setting.type, setting.value),
            }),
            {} as Record<string, SettingType>,
        );

        const timestamp = Date.now();

        // Cache individual settings
        for (const key in result) {
            this.cachedSettings[key] = { value: result[key], timestamp };
        }

        // Cache the group result
        this.cachedGroups[group] = { value: result, timestamp };

        return result;
    }

    public async setSetting(key: string, value: SettingType): Promise<void> {
        if (!settingsTypeValues.includes(typeof value as SettingTypeValue)) {
            value = '';
        }

        await DynamoDbService.getInstance().addItem(
            SettingsService.TABLE_NAME,
            {
                key,
                value: String(value),
                type: typeof value as SettingTypeValue,
            },
        );

        this.cachedSettings[key] = {
            value: this.castType(
                typeof value as SettingTypeValue,
                String(value),
            ),
            timestamp: Date.now(),
        };
    }

    private castType(type: SettingTypeValue, value: string): SettingType {
        switch (type) {
            case 'string':
                return String(value);
            case 'number':
                return Number(value);
            case 'boolean':
                return value === 'true';
            default:
                return null;
        }
    }
}
