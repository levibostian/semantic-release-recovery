import { PluginConfig, parseConfig } from "./pluginConfig.js"

describe('parseConfig', () => {
  it('should return error if no config defined', () => {
    expect(parseConfig({})).toBeInstanceOf(Error)
  })

  it('should return error if config doesnt define plugins', () => {
    expect(parseConfig({foo: false})).toBeInstanceOf(Error)
  })

  it('should return error if no plugins are defined', () => {
    expect(parseConfig({plugins: []})).toBeInstanceOf(Error)
  })

  it('should return error if no plugins are defined', () => {
    const expected = [
      {
        name: '@semantic-release/npm',
        config: {
          npmPublish: false
        }
      }
    ]    

    expect(parseConfig({plugins: [
      ['@semantic-release/npm', {
        npmPublish: false
      }]
    ]})).toEqual(expected)
  })

  it('should work with just name of plugin, no config', () => {
    const expected = [
      {
        name: '@semantic-release/npm',
        config: {}
      }
    ]    

    expect(parseConfig({plugins: [
      '@semantic-release/npm',
    ]})).toEqual(expected)
  })
})