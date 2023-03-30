module.exports = {
  root: true,
  plugins: ['@dvcol/presets', 'import', 'react-hooks'],
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
            pattern: '@dvcol/**',
            position: 'before',
          },
          {
            group: 'internal',
            pattern: '@src/**',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: __dirname,
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'class-methods-use-this': 'off',
  },
};
