import { FailContext, NextRelease, VerifyReleaseContext, VerifyConditionsContext } from "semantic-release"
import * as git from "./git"

let nextRelease: NextRelease | undefined;
let isDryRun: boolean = false;

const packageInfo: { name: string, homepage: string } = require("../package.json")

export async function verifyConditions(pluginConfig: {}, context: VerifyConditionsContext & {options: {dryRun: boolean}}) {
  nextRelease = undefined // to reset the plugin's state 

  context.logger.log(`👋 Hello from the ${packageInfo.name} plugin! My job is to gracefully handle failed deployments so you can simply re-try the deployment if you wish. Without a plugin like this, you would have to manually clean up the failed deployment in order to retry. You can learn more about failed deployment cleanup recommendations here: ${packageInfo.homepage}`)

  isDryRun = context.options.dryRun;

  if (isDryRun) {
    context.logger.log(`Oh, it looks like you are running your deployment with dry-mode enabled. I will make sure all commands I run are also run in dry-mode. I got you! 👊`)
  }
}

export async function verifyRelease(pluginConfig: {}, context: VerifyReleaseContext) {
  nextRelease = context.nextRelease;

  context.logger.log(`Next release is planned to be: ${nextRelease.gitTag}. If this deployment fails, I will delete the git tag: ${nextRelease.gitTag}.`)
  if (isDryRun) {
    context.logger.log(`Well, I will pretend to delete it, since you are running in dry-mode. 😉`)
  }  
}

export async function fail(pluginConfig: {}, context: FailContext) {
  if (!nextRelease) {
    return 
  }

  context.logger.log(`Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.`)

  context.logger.log(`Deleting git tag ${nextRelease.gitTag}...`)
  if (isDryRun) {
    context.logger.log(`(Well, not really deleting it. You are running in dry-mode. I am just playing pretend here. 🧙‍♂️)`)
  }
  await git.deleteTag(nextRelease.gitTag, isDryRun, context)

  context.logger.log(`Done! Cleanup is complete and you should be able to retry the deployment now.`)
  if (isDryRun) {
    context.logger.log(`Well, technically a deployment was not actually attempted. You can try for *real* now. 😉`)
  }
}
