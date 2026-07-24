import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import * as espree from 'espree';

const eslintConfig = defineConfig([
  ...nextVitals,
  // Pin the React version to avoid eslint-plugin-react's auto-detection
  // crashing under ESLint 10 (contextOrFilename.getFilename is not a function).
  {
    settings: {
      react: { version: '19' },
    },
  },
  // eslint-config-next applies Next.js' bundled Babel parser to plain JS
  // files, and its ScopeManager is incompatible with ESLint 10
  // (scopeManager.addGlobals is not a function). Use the default parser
  // (espree) for JS config files instead.
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      parser: espree,
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
