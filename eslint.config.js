import { globalIgnores } from 'eslint/config'
import { neostandard } from 'neostandard'

export default [
  globalIgnores([
    'src/midi/lib/**',
    'src/drawer/lib/**',
    'src/drawer/elements/basic/convertSvgToAnimatedString.js'
  ]),
  ...neostandard(),
  {
    languageOptions: {
      globals: {
        self: 'readonly',
        WorkerGlobalScope: 'readonly',
        XMLHttpRequest: 'readonly'
      }
    },
    rules: {
      '@stylistic/array-bracket-spacing': ['error', 'always'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quote-props': 'off'
    }
  }
]
