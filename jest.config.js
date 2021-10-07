module.exports = {
    coverageReporters: [
        'lcov',
        'html'
    ],
    coveragePathIgnorePatterns: [],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js'
    ],
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.(js|jsx)?$': 'babel-jest'
    },
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
