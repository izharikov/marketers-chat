import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';
import importNewlines from 'eslint-plugin-import-newlines';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'components/ai-elements/**'
  ]),
  {
    plugins: {
      'import-newlines': importNewlines,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      'quotes': ['warn', 'single'],
      'import-newlines/enforce': ['error', { items: 40, 'max-len': 120 }],

      // 1. Enforce correct import order
      'import/order': [
        'error',
        {
          groups: [
            'builtin',    // node:fs, node:path
            'external',   // react, next, npm packages
            'internal',   // @/ paths
            'parent',     // ../
            'sibling',    // ./
            'index',      // ./index
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before'
            },
            {
              pattern: 'next',
              group: 'external',
              position: 'before'
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before'
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after'
            }
          ],
          pathGroupsExcludedImportTypes: ['react', 'next'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],

      // 2. Enforce absolute @/ imports over relative ../
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message: 'Use absolute imports (@/...) instead of relative paths going up directories.'
            }
          ]
        }
      ],

      // 3. No blank lines between import statements within the same group
      'padding-line-between-statements': [
        'error',
        { blankLine: 'never', prev: 'import', next: 'import' }
      ],
    }
  }
]);

export default eslintConfig;