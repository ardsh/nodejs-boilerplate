module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '((\\.)(test|spec))\\.(t|j)sx?$',
    setupFilesAfterEnv: ['./src/__tests__/setup.ts'],
    globals: {
        'ts-jest': {
            diagnostics: { warnOnly: true }
        },
    },
};
