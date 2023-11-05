const { defaults: tsjPreset } = require('ts-jest/presets')
// const { defaultsESM: tsjPreset } = require('ts-jest/presets')
// const { jsWithTs: tsjPreset } = require('ts-jest/presets')
// const { jsWithTsESM: tsjPreset } = require('ts-jest/presets')
// const { jsWithBabel: tsjPreset } = require('ts-jest/presets')
// const { jsWithBabelESM: tsjPreset } = require('ts-jest/presets')

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  resetMocks: true,
  collectCoverage: true,
  clearMocks: true,  
  restoreMocks: true, // resets spys 
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // [...]
  transform: {
    ...tsjPreset.transform,
    // [...]
  },
}