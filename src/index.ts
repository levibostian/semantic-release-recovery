import { FailContext, VerifyReleaseContext, VerifyConditionsContext, AnalyzeCommitsContext, PrepareContext, PublishContext, AddChannelContext, SuccessContext, BaseContext } from "semantic-release"
import { PluginConfig, parseConfig, DeploymentPlugin } from "./type/pluginConfig";
import * as npm from "./npm";
import { SemanticReleasePlugin } from "./type/semanticReleasePlugin";
import * as git from "./git"

// global variables used by the whole plugin as it goes through semantic-release lifecycle
// Deployment plugins that are parsed, loaded, and ready to call functions on. 
let deploymentPlugins: Array<{module: SemanticReleasePlugin, config: DeploymentPlugin}> = []

export function resetPlugin() { // useful for running tests 
  deploymentPlugins = []
}

// semantic-release uses a lib called signale for logging. This lib helps semantic-release make logs better by telling you what plugin is executing. 
// Because this plugin's job is to execute another plugin, we want to do the same thing that semantic-release does to show when the deploy plugin is executing. 
// We should see logs such as: 
// [semantic-release] [semantic-release-precheck] Running verifyConditions for deployment plugin: @semantic-release/npm
// [semantic-release] [@semantic-release/npm] running publish step here. 
// Depending on what plugin is running, our precheck plugin or the deploy plugin. 
// 
// This function modifies the context object with the modified logger so we can send the modified context to the deploy plugin.
export function prepareLoggerForDeploymentPlugin<CONTEXT>(context: BaseContext, deploymentPlugin: DeploymentPlugin): CONTEXT {
  let logger = context.logger 

  // the logic for how to modify the logger is from: https://github.com/semantic-release/semantic-release/blob/e759493e074650748fc3bbef9e640db413b52d56/lib/plugins/normalize.js#L40
  if (logger.scope && logger.scope instanceof Function) { // check if the logger has a scope function before calling it to try to be compatible if semantic-release ever changes the lib they use for logging 
    // we need to get the existing scopes, convert it to an array, add the name of the plugin, then use that to modify the existing logger. 
    let existingScopes: string[] | string = (logger as any).scopeName
    if (typeof existingScopes === "string") {
      existingScopes = [existingScopes]
    }
    existingScopes.push(deploymentPlugin.name)

    logger = logger.scope(...existingScopes)
  }

  // We want to return a new object so we don't modify the original context object. Our own plugin still uses the original context object.
  // return a new one that is only passed to the deploy plugin.
  let modifiedContext = Object.assign({}, context)
  modifiedContext.logger = logger

  return modifiedContext as CONTEXT
}

// -- Plugin lifecycle functions 

export async function verifyConditions(pluginConfig: PluginConfig, context: VerifyConditionsContext) {
  const pluginConfigOrError = parseConfig(pluginConfig)
  if (pluginConfigOrError instanceof Error) {
    throw pluginConfigOrError
  }

  // This is the first function that semantic-release calls on a plugin. 
  // Check if the deployment plugin is already installed. If not, we must throw an error because we cannot install it for them. 
  // I have tried to do that, but it seems that node loads all modules at startup so it cannot find a module after it's installed during runtime.   
  for (const plugin of pluginConfigOrError) {
    let alreadyInstalledPlugin = await npm.getDeploymentPlugin(plugin.name)
    if (!alreadyInstalledPlugin) {
      throw new Error(`Deployment plugin, ${plugin.name}, doesn't seem to be installed. Install it with npm and then try running your deployment again.`)
    }

    deploymentPlugins.push({
      module: alreadyInstalledPlugin,
      config: plugin
    })
  }

  context.logger.log(`Deployment plugins found: ${deploymentPlugins.map(plugin => plugin.config.name).join(", ")}`)

  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.verifyConditions) {
      await deployPlugin.module.verifyConditions(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function analyzeCommits(pluginConfig: PluginConfig, context: AnalyzeCommitsContext) {  
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.analyzeCommits) {
      await deployPlugin.module.analyzeCommits(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function verifyRelease(pluginConfig: PluginConfig, context: VerifyReleaseContext) {
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.verifyRelease) {
      await deployPlugin.module.verifyRelease(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function generateNotes(pluginConfig: PluginConfig, context: VerifyReleaseContext) {
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.generateNotes) {
      await deployPlugin.module.generateNotes(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function prepare(pluginConfig: PluginConfig, context: PrepareContext) {
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.prepare) {
      await deployPlugin.module.prepare(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function publish(pluginConfig: PluginConfig, context: PublishContext) {  
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.publish) {
      context.logger.log(`Running publish step for deployment plugin: ${deployPlugin.config.name}`)

      try {
        await deployPlugin.module.publish(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
      } catch (error) {
        context.logger.log(`Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.`)

        // delete git tag that semantic-release created so that you can retry deployment. 
        const gitTagToDelete = context.nextRelease.gitTag
        context.logger.log(`Deleting git tag ${gitTagToDelete}...`)
        await git.deleteTag(gitTagToDelete, context)    
        context.logger.log(`Done! Cleanup is complete and you should be able to retry the deployment now.`) 
        
        // re-throw the error as this is the behavior that semantic-release expects.
        // thrown errors by any plugin are meant to stop execution of semantic-release.
        throw error
      }
    }
  }
}

export async function addChannel(pluginConfig: PluginConfig, context: AddChannelContext) {  
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.addChannel) {
      await deployPlugin.module.addChannel(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function success(pluginConfig: PluginConfig, context: SuccessContext) {
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.success) {
      await deployPlugin.module.success(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

export async function fail(pluginConfig: PluginConfig, context: FailContext) {  
  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.fail) {
      await deployPlugin.module.fail(deployPlugin.config.config || {}, prepareLoggerForDeploymentPlugin(context, deployPlugin.config))
    }
  }
}

