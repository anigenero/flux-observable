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
        // '<rootDir>/src/__testutils__/requestAnimationFrame.js'
    ],
    transform: {
        '^.+\\.(js|jsx)?$': 'babel-jest'
    },
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
