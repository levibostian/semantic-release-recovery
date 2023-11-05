import { Exec, exec } from "./exec.js"
import { BaseContext } from "semantic-release"

export interface Git {
  deleteTag(tagName: string, context: BaseContext): Promise<void>
}

export class GitImpl implements Git {
  private _exec: Exec 

  constructor(execImpl: Exec = exec) {
    this._exec = execImpl
  }

  async deleteTag(tagName: string, context: BaseContext): Promise<void> {
    let command = `git push origin --delete ${tagName}`

    context.logger.log(`Running git command: \`${command}\``)

    await this._exec.runCommand(command, context) 
  }
}

class GitMock implements Git {  
  callCount: Map<string, number> = new Map()
  call: Map<string, any> = new Map()
  calls: Map<string, any[]> = new Map()

  async deleteTag(tagName: string, context: BaseContext): Promise<void> {
    this.callCount.set('deleteTag', (this.callCount.get('deleteTag') || 0) + 1)
    this.call.set('deleteTag', {tagName, context})

    let existingCalls = this.calls.get('deleteTag') || []
    existingCalls.push({tagName, context})
    this.calls.set('deleteTag', existingCalls)

    return Promise.resolve()
  }
}

export let git: Git = new GitImpl()
export let gitMock = new GitMock()

export const mockGit = () => {
  gitMock = new GitMock()
  git = gitMock
}
