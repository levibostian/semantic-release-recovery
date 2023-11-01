import { BaseContext } from "semantic-release"
import { DeploymentPlugin } from "./type/pluginConfig.js"

export interface SemanticReleaseLogger {
  log: (message: string) => void
  error: (message: string) => void
}

// semantic-release uses a lib called signale for logging. This lib helps semantic-release make logs better by telling you what plugin is executing. 
// Because this plugin's job is to execute another plugin, we want to do the same thing that semantic-release does to show when the deploy plugin is executing. 
// We should see logs such as: 
// [semantic-release] [semantic-release-precheck] Running verifyConditions for deployment plugin: @semantic-release/npm
// [semantic-release] [semantic-release-precheck] [@semantic-release/npm] running publish step here. 
// Depending on what plugin is running, our precheck plugin or the deploy plugin. 
// 
// These functions get us the logger that we need for each case.

export const getDeploymentPluginLogger = (context: BaseContext, deploymentPlugin: DeploymentPlugin): SemanticReleaseLogger => {
  return getSemanticReleaseLogger({context, deploymentPlugin, isLoggerForDeploymentPlugin: true})
}

export const getLogger = (context: BaseContext, deploymentPlugin: DeploymentPlugin): SemanticReleaseLogger => {
  return getSemanticReleaseLogger({context, deploymentPlugin, isLoggerForDeploymentPlugin: false})
}

const getSemanticReleaseLogger = (args: {context: BaseContext, deploymentPlugin: DeploymentPlugin, isLoggerForDeploymentPlugin: Boolean}): SemanticReleaseLogger => {
  let logger = args.context.logger

  // the logic for how to modify the logger is from: https://github.com/semantic-release/semantic-release/blob/e759493e074650748fc3bbef9e640db413b52d56/lib/plugins/normalize.js#L40
  if (logger.scope && logger.scope instanceof Function) { // check if the logger has a scope function before calling it to try to be compatible if semantic-release ever changes the lib they use for logging 
    // we need to get the existing scopes, convert it to an array, add the name of the plugin, then use that to modify the existing logger. 
    let existingScopes: string[] | string = (logger as any).scopeName
    if (typeof existingScopes === "string") {
      existingScopes = [existingScopes]
    }

    if (args.isLoggerForDeploymentPlugin) {
      // Add deployment plugin name. 
      // Logs should look like: [semantic-release] [@semantic-release/npm] running publish step here.
      existingScopes.push(args.deploymentPlugin.name)
    } else {
      // Remove deployment plugin name. 
      // Logs should look like: [semantic-release] [semantic-release-recovery] we are deleting git tag 
      existingScopes = existingScopes.filter(scope => scope !== args.deploymentPlugin.name)
    }

    logger = logger.scope(...existingScopes)
  }

  return logger 
}