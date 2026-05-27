export const settingsTypeValues = ['string', 'number', 'boolean'] as const;

export type SettingTypeValue = (typeof settingsTypeValues)[number];

export type SettingType = string | number | boolean | null;

export interface Setting {
    key: string;
    value: string;
    type: SettingTypeValue;
}

export interface CachedSetting {
    value: SettingType;
    timestamp: number;
}
