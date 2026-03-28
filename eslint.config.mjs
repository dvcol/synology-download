import { defineReactConfig } from '@dvcol/eslint-config';

export default defineReactConfig(
  {
    typescript: {
      tsconfigPath: new URL('./tsconfig.vitest.json', import.meta.url).pathname,
      tsconfigRootDir: new URL('./', import.meta.url).pathname,
    },
    ignores: [
      'src/assets/icons/**/*',
      '.github/copilot-instructions.md',
      'README.md',
    ],
  },
);
