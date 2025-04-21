import { createDefaultPreset } from 'ts-jest';

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    ...createDefaultPreset(),
    preset: 'ts-jest/presets/default-esm',
};
