async function fail(pluginConfig: any, context: any) {
  throw new Error('failed')
}

module.exports = { fail };