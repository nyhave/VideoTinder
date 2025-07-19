module.exports = {
  projects: [
    {
      displayName: 'app',
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest'
      },
      extensionsToTreatAsEsm: ['.jsx'],
      testMatch: ['<rootDir>/src/**/__tests__/**/*.test.js']
    },
    '<rootDir>/netlify/functions'
  ]
};
