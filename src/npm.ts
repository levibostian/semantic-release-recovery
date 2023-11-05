import { SemanticReleasePlugin } from "./type/semanticReleasePlugin.js";

export interface Npm {
  getDeploymentPlugin(name: string): Promise<SemanticReleasePlugin | undefined>
}

export class NpmImpl implements Npm {
  async getDeploymentPlugin(name: string): Promise<SemanticReleasePlugin | undefined> {
    try {
      let plugin = await import(name)
      return plugin
    } catch (e) {
      return undefined
    }
  }
}

class NpmMock implements Npm {  
  callCount: Map<string, number> = new Map()
  call: Map<string, any> = new Map()
  calls: Map<string, any[]> = new Map()

  getDeploymentPluginReturn: Promise<SemanticReleasePlugin | undefined> = Promise.resolve(undefined)

  getDeploymentPlugin(name: string): Promise<SemanticReleasePlugin | undefined> {
    this.callCount.set('getDeploymentPlugin', (this.callCount.get('getDeploymentPlugin') || 0) + 1)
    this.call.set('getDeploymentPlugin', {name})

    let existingCalls = this.calls.get('getDeploymentPlugin') || []
    existingCalls.push({name})
    this.calls.set('getDeploymentPlugin', existingCalls)

    return this.getDeploymentPluginReturn
  }
}

export let npm: Npm = new NpmImpl()
export let npmMock = new NpmMock()
export const mockNpm = () => {
  npmMock = new NpmMock()
  npm = npmMock
}

