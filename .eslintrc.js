module.exports = {
  root: true,
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier', 'import', 'jsx-a11y', '@dvcol/presets'],
  extends: ['plugin:@dvcol/presets/react'],
  globals: {
    chrome: 'readonly',
  },
  env: {
    webextensions: true,
  },
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.spec.json'],
  },
  rules: {
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type', 'object'],
        'newlines-between': 'always-and-inside-groups',
        pathGroups: [
          {
            group: 'internal',
            pattern: '@src/**',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: __dirname,
      },
    ],
  },
};
