import { FailContext, VerifyConditionsContext, VerifyReleaseContext } from 'semantic-release';
import { verifyConditions, verifyRelease, fail } from './index';
import * as git from './git';

let context: VerifyConditionsContext & VerifyReleaseContext & FailContext & {options: {dryRun: boolean}} = {
  env: {},
  envCi: {
    isCi: true,
    commit: '1234567890',
    branch: 'main',
  },
  logger: {
    log: (message: string) => {
      console.log(message)
    }
  },
  branch: {
    name: 'main'
  },
  branches: [{name: 'main'}],
  stderr: process.stderr,
  stdout: process.stdout,
  nextRelease: {
    channel: 'main',
    name: 'main',
    type: 'major',
    version: '1.0.0',
    gitTag: 'v1.0.0',
    gitHead: '1234567890',
    notes: 'Release notes'
  },
  commits: [],
  releases: [],
  lastRelease: {
    version: '',
    gitTag: '',
    channels: [],
    gitHead: '',
    name: '',
  },
  errors: {
    errors: [],
    message: '',
    name: ''
  },
  options: {
    dryRun: true
  }
}

describe(('Test fail function, deleting git tag'), () => {
  it('given running in dry-mode, expect to run git command also in dry-mode', async () => {
    context.options.dryRun = true 

    jest.spyOn(git, 'deleteTag').mockReturnValue(Promise.resolve())

    await verifyConditions({}, context)
    await verifyRelease({}, context)
    await fail({}, context)

    expect(git.deleteTag).toHaveBeenCalledWith('v1.0.0', true, context)
  });

  it('given not running in dry-mode, expect to run git command not in dry-mode', async () => {
    context.options.dryRun = false

    jest.spyOn(git, 'deleteTag').mockReturnValue(Promise.resolve())

    await verifyConditions({}, context)
    await verifyRelease({}, context)
    await fail({}, context)

    expect(git.deleteTag).toHaveBeenCalledWith('v1.0.0', false, context)
  });

  it('given no next release made, expect skip running plugin', async () => {
    jest.spyOn(git, 'deleteTag').mockReturnValue(Promise.resolve())

    await verifyConditions({}, context)
    // skip running verify release as semantic-release would not call this function if no next release 
    await fail({}, context)

    expect(git.deleteTag).not.toHaveBeenCalled()
  });
});

describe('logging', () => {
  let contextWithLogger = context
  let logMock = jest.fn()
  contextWithLogger.logger.log = logMock

  beforeEach(async() => {
    jest.spyOn(git, 'deleteTag').mockResolvedValue(Promise.resolve()) 
  })

  it('should generate logs that is expected, given running in dry-mode', async () => {
    contextWithLogger.options.dryRun = true 

    await verifyConditions({}, contextWithLogger)
    await verifyRelease({}, contextWithLogger)
    await fail({}, contextWithLogger)

    const actualLogs = logMock.mock.calls.flatMap((call) => call[0])

    expect(actualLogs).toMatchInlineSnapshot(`
[
  "👋 Hello from the semantic-release-recovery plugin! My job is to gracefully handle failed deployments so you can simply re-try the deployment if you wish. Without a plugin like this, you would have to manually clean up the failed deployment in order to retry. You can learn more about failed deployment cleanup recommendations here: https://github.com/levibostian/semantic-release-recovery#readme",
  "Oh, it looks like you are running your deployment with dry-mode enabled. I will make sure all commands I run are also run in dry-mode. I got you! 👊",
  "Next release is planned to be: v1.0.0. If this deployment fails, I will delete the git tag: v1.0.0.",
  "Well, I will pretend to delete it, since you are running in dry-mode. 😉",
  "Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.",
  "Deleting git tag v1.0.0...",
  "(Well, not really deleting it. You are running in dry-mode. I am just playing pretend here. 🧙‍♂️)",
  "Done! Cleanup is complete and you should be able to retry the deployment now.",
  "Well, technically a deployment was not actually attempted. You can try for *real* now. 😉",
]
`)
  })

  it('should generate logs that is expected', async () => {
    contextWithLogger.options.dryRun = false

    await verifyConditions({}, contextWithLogger)
    await verifyRelease({}, contextWithLogger)
    await fail({}, contextWithLogger)

    const actualLogs = logMock.mock.calls.flatMap((call) => call[0])

    expect(actualLogs).toMatchInlineSnapshot(`
[
  "👋 Hello from the semantic-release-recovery plugin! My job is to gracefully handle failed deployments so you can simply re-try the deployment if you wish. Without a plugin like this, you would have to manually clean up the failed deployment in order to retry. You can learn more about failed deployment cleanup recommendations here: https://github.com/levibostian/semantic-release-recovery#readme",
  "Next release is planned to be: v1.0.0. If this deployment fails, I will delete the git tag: v1.0.0.",
  "Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.",
  "Deleting git tag v1.0.0...",
  "Done! Cleanup is complete and you should be able to retry the deployment now.",
]
`)
  })
})

