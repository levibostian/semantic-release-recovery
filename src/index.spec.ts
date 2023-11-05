import { FailContext, VerifyConditionsContext, VerifyReleaseContext } from 'semantic-release';
import { verifyConditions, verifyRelease, fail, publish } from './index.js';
import {mockGit, gitMock} from './git.js';
import { PluginConfig } from './type/pluginConfig.js';
import { MockSemanticReleasePlugin } from "./type/semanticReleasePlugin.js";
import { mockNpm, npmMock } from "./npm.js"

let context: VerifyConditionsContext & VerifyReleaseContext & FailContext = {
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
  }
}

let mockPlugin = new MockSemanticReleasePlugin()

beforeEach(() => {
  mockGit()
  mockNpm()

  mockPlugin = new MockSemanticReleasePlugin()

  npmMock.getDeploymentPluginReturn = Promise.resolve(mockPlugin)
})

const getPluginConfig = (): any => {
  return {plugins: [
    ["@semantic-release/exec", {
      publishCmd: "echo 'running exec' && false"
    }] 
  ]}
}

describe('publish', () => {  

  describe('deployment plugin fails', () => {

    it('should delete git tag', async () => {
      mockPlugin.publish = async () => {
        throw new Error('Something went wrong')
      }

      await verifyConditions(getPluginConfig(), context)
      await expect(publish(getPluginConfig(), context)).rejects.toThrowError()

      expect(gitMock.call.get('deleteTag').tagName).toEqual('v1.0.0')
    })

    it('should re-throw error thrown by deployment plugin', async () => {
      mockPlugin.publish = async () => {
        throw new Error('Something went wrong')
      }

      await verifyConditions(getPluginConfig(), context)
      await expect(publish(getPluginConfig(), context)).rejects.toThrow('Something went wrong')
    })
  })

  describe('deployment plugin succeeds', () => {

    it('should not delete tag, should not throw error', async () => {
      mockPlugin.publish = async () => {
        return Promise.resolve()
      }

      await verifyConditions(getPluginConfig(), context)
      await publish(getPluginConfig(), context)

      expect(gitMock.callCount.get('deleteTag') || 0).toEqual(0)
    })
  })
});

describe('logging', () => {
  let contextWithLogger = context
  let logMock = jest.fn()
  contextWithLogger.logger.log = logMock

  it('should generate logs after successful deployment', async () => {    
    await verifyConditions(getPluginConfig(), contextWithLogger)
    await publish(getPluginConfig(), contextWithLogger)

    const actualLogs = logMock.mock.calls.flatMap((call) => call[0])

    expect(actualLogs).toMatchInlineSnapshot(`
[
  "Deployment plugins found: @semantic-release/exec",
  "Next release is planned to be: 1.0.0. If this deployment fails, I will delete the git tag: v1.0.0",
  "Running publish step for deployment plugin: @semantic-release/exec",
]
`)
  })

  it('should generate logs after failed deployment', async () => {    
    mockPlugin.publish = async () => {
      throw new Error('Something went wrong')
    }

    await verifyConditions(getPluginConfig(), contextWithLogger)
    await expect(publish(getPluginConfig(), contextWithLogger)).rejects.toThrowError()

    const actualLogs = logMock.mock.calls.flatMap((call) => call[0])

    expect(actualLogs).toMatchInlineSnapshot(`
[
  "Deployment plugins found: @semantic-release/exec",
  "Next release is planned to be: 1.0.0. If this deployment fails, I will delete the git tag: v1.0.0",
  "Running publish step for deployment plugin: @semantic-release/exec",
  "Looks like something went wrong during the deployment. No worries! I will try to help by cleaning up after the failed deployment so you can re-try the deployment if you wish.",
  "Deleting git tag v1.0.0...",
  "Cleanup is complete and you should be able to retry the deployment now.",
  "Re-throwing error thrown by @semantic-release/exec to stop semantic-release from continuing to deploy.",
]
`)
  })
})

