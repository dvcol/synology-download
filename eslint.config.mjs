import { fileURLToPath } from 'node:url';

import { defineReactConfig } from '@dvcol/eslint-config';

export default defineReactConfig(
  {
    typescript: {
      tsconfigPath: fileURLToPath(new URL('./tsconfig.vitest.json', import.meta.url)),
      tsconfigRootDir: fileURLToPath(new URL('./', import.meta.url)),
    },
    ignores: [
      'src/assets/icons/**/*',
      '.github/copilot-instructions.md',
      'README.md',
    ],
  },
);
