import { FailContext, NextRelease, VerifyReleaseContext, VerifyConditionsContext } from "semantic-release"
import git from "./git"

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
  const { logger, stdout } = context;

  if (!nextRelease) {
    return logger.log('It looks like a new release was not created. Skipping running plugin.')
  }

  stdout.write(await git.deleteTag(nextRelease.gitTag, isDryRun))

  logger.log(`Deleted tag ${nextRelease.gitTag}`)  
}

