export interface DeploymentPlugin {
  name: string
  config: object
}

export type PluginConfig = Array<DeploymentPlugin>

// returns a string (error message) if invalid. 
export function parseConfig(config: any): Error | PluginConfig {  
  if (!config.plugins) return Error(`Configuration for plugin is in an incorrect format. See docs for how to implement.`)

  try {
    const deploymentPlugins = config.plugins.map((plugin: any[]) => {
      if (typeof plugin == "string") {
        return {
          name: plugin,
          config: {}
        }
      }

      return {
        name: plugin[0] as string,
        config: plugin[1]
      }
    })

    if (deploymentPlugins.length === 0) return Error(`No deployment plugins found. See docs for how to implement.`)

    return deploymentPlugins
  } catch (error) {
    return Error(`Configuration for plugin is in an incorrect format. See docs for how to implement. Error thrown: ${error}`)
  }  
}