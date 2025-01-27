const baseConfig = require("../../jest.config");

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    "@core/(.*)": "<rootDir>/src/app/core/$1",
  },
  preset: "jest-preset-angular",
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      { tsconfig: "<rootDir>/projects/cafe-admin/tsconfig.spec.json" },
    ],
  },
};
