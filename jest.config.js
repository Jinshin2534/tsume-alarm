module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    // pnpm stores packages under node_modules/.pnpm/<pkg>/node_modules/<pkg>/...
    // so we must whitelist both the direct and the nested-inside-.pnpm forms.
    'node_modules/(?!((\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|tsshogi)))',
  ],
};
