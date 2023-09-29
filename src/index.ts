import { FailContext, NextRelease, VerifyReleaseContext, VerifyConditionsContext } from "semantic-release"
import * as git from "./git"

let nextRelease: NextRelease | undefined;
let isDryRun: boolean = false;

export async function verifyConditions(pluginConfig: {}, context: VerifyConditionsContext & {options: {dryRun: boolean}}) {
  nextRelease = undefined // to reset the plugin's state 

  isDryRun = context.options.dryRun;
}

export async function verifyRelease(pluginConfig: {}, context: VerifyReleaseContext) {
  nextRelease = context.nextRelease;
}

export async function fail(pluginConfig: {}, context: FailContext) {
  const { logger } = context;

  if (!nextRelease) {
    return logger.log('It looks like a new release was not created. Skipping running plugin.')
  }

  await git.deleteTag(nextRelease.gitTag, isDryRun, context)

  logger.log(`Deleted tag ${nextRelease.gitTag}`)  
}

