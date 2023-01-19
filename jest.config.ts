import type { Config } from 'jest'
import { resolve } from 'path'

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json'
      },
    ],
  },
  coverageReporters: ['lcov'],
  coverageDirectory: resolve('coverage'),
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ]
}

export default config