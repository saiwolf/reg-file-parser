// jest.config.ts
import type { InitialOptionsTsJest } from "ts-jest/dist/types"

const config: InitialOptionsTsJest = {
    preset: "ts-jest/presets/js-with-ts-esm",
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js": "$1",
    },
    testMatch: ["**/__tests__/**/*.test.ts"]
}

export default config;

