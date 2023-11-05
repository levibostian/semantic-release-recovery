import { FailContext, VerifyReleaseContext, VerifyConditionsContext, AnalyzeCommitsContext, PrepareContext, PublishContext, AddChannelContext, SuccessContext, BaseContext } from "semantic-release"
import { PluginConfig, parseConfig, DeploymentPlugin } from "./type/pluginConfig.js";
import {npm} from "./npm.js";
import { SemanticReleasePlugin } from "./type/semanticReleasePlugin.js";
import {git} from "./git.js"
import { getDeploymentPluginLogger, getLogger } from "./logger.js"

// global variables used by the whole plugin as it goes through semantic-release lifecycle
// Deployment plugins that are parsed, loaded, and ready to call functions on. 
let deploymentPlugins: Array<{module: SemanticReleasePlugin, config: DeploymentPlugin}> = []

export function resetPlugin() { // useful for running tests 
  deploymentPlugins = []
}

function modifyContext(args: {context: BaseContext, deployPluginConfig: DeploymentPlugin, isForDeploymentPlugin: boolean}) {
  if (args.isForDeploymentPlugin) {
    args.context.logger = getDeploymentPluginLogger(args.context, args.deployPluginConfig)
  } else {
    args.context.logger = getLogger(args.context, args.deployPluginConfig)
  }  
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
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.verifyConditions) {
      await deployPlugin.module.verifyConditions(deployPlugin.config.config || {}, context)
    }
  }
}

export async function analyzeCommits(pluginConfig: PluginConfig, context: AnalyzeCommitsContext) {  
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.analyzeCommits) {
      await deployPlugin.module.analyzeCommits(deployPlugin.config.config || {}, context)
    }
  }
}

export async function verifyRelease(pluginConfig: PluginConfig, context: VerifyReleaseContext) {
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.verifyRelease) {
      await deployPlugin.module.verifyRelease(deployPlugin.config.config || {}, context)
    }
  }
}

export async function generateNotes(pluginConfig: PluginConfig, context: VerifyReleaseContext) {
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.generateNotes) {
      await deployPlugin.module.generateNotes(deployPlugin.config.config || {}, context)
    }
  }
}

export async function prepare(pluginConfig: PluginConfig, context: PrepareContext) {
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.prepare) {
      await deployPlugin.module.prepare(deployPlugin.config.config || {}, context)
    }
  }
}

export async function publish(pluginConfig: PluginConfig, context: PublishContext) {
  context.logger.log(`Next release is planned to be: ${context.nextRelease.version}. If this deployment fails, I will delete the git tag: ${context.nextRelease.gitTag}`)

  for (const deployPlugin of deploymentPlugins) {
    if (deployPlugin.module.publish) {
      modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: false})
      context.logger.log(`Running publish step for deployment plugin: ${deployPlugin.config.name}`)
      
      modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})
      try {        
        await deployPlugin.module.publish(deployPlugin.config.config || {}, context)
      } catch (error) {
        modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: false})

        context.logger.log(`Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.`)

        // delete git tag that semantic-release created so that you can retry deployment. 
        const gitTagToDelete = context.nextRelease.gitTag
        context.logger.log(`Deleting git tag ${gitTagToDelete}...`)
        await git.deleteTag(gitTagToDelete, context)    
        context.logger.log(`Cleanup is complete and you should be able to retry the deployment now.`) 

        context.logger.log(`Re-throwing error thrown by ${deployPlugin.config.name} to stop semantic-release from continuing to deploy.`) 
        
        // re-throw the error as this is the behavior that semantic-release expects.
        // thrown errors by any plugin are meant to stop execution of semantic-release.
        throw error
      }
    }
  }
}

export async function addChannel(pluginConfig: PluginConfig, context: AddChannelContext) {  
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.addChannel) {
      await deployPlugin.module.addChannel(deployPlugin.config.config || {}, context)
    }
  }
}

export async function success(pluginConfig: PluginConfig, context: SuccessContext) {
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.success) {
      await deployPlugin.module.success(deployPlugin.config.config || {}, context)
    }
  }
}

export async function fail(pluginConfig: PluginConfig, context: FailContext) {  
  for (const deployPlugin of deploymentPlugins) {
    modifyContext({context, deployPluginConfig: deployPlugin.config, isForDeploymentPlugin: true})

    if (deployPlugin.module.fail) {
      await deployPlugin.module.fail(deployPlugin.config.config || {}, context)
    }
  }
}

