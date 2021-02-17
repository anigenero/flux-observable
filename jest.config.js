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
    preset: 'ts-jest',
    setupFiles: [
        '<rootDir>/jest.setup.ts'
    ],
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
