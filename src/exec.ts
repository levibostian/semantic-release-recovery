import { execSync } from 'child_process';
import { BaseContext } from "semantic-release"

export interface Exec {
  runCommand(command: string, context: BaseContext): Promise<void> 
}

class ExecImpl implements Exec {
  async runCommand(command: string, context: BaseContext): Promise<void> {
    try {
      let stdout = execSync(command)
      context.logger.log(stdout.toString())
    } catch (error: any) {
      let stdout = error.stdout.toString()
      if (stdout) context.logger.log(stdout) 
  
      let stderr = error.stderr.toString()
      if (stderr) context.logger.error(stderr) 
      
      throw error
    }
  }
}

export class ExecMock implements Exec {  
  callCount: Map<string, number> = new Map()
  call: Map<string, any> = new Map()
  calls: Map<string, any[]> = new Map()

  runCommand(command: string, context: BaseContext ): Promise<void> {
    this.callCount.set('runCommand', (this.callCount.get('runCommand') || 0) + 1)
    this.call.set('runCommand', {command, context})

    let existingCalls = this.calls.get('runCommand') || []
    existingCalls.push({command, context})
    this.calls.set('runCommand', existingCalls)

    return Promise.resolve()
  }
}

export const exec: Exec = new ExecImpl()
