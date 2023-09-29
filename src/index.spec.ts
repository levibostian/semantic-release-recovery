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

