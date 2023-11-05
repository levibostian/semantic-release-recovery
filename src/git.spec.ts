import { ExecMock } from "./exec.js"
import { BaseContext } from 'semantic-release';
import { GitImpl } from "./git.js"

let context: BaseContext & {options: {dryRun: boolean}} = {  
  logger: {
    log: (message: string) => {
      console.log(message)
    }
  },
  stderr: process.stderr,
  stdout: process.stdout,
  options: {
    dryRun: true
  }
}

let execMock = new ExecMock()
let git = new GitImpl(execMock)
beforeAll(() => {
  execMock = new ExecMock()
  git = new GitImpl(execMock)
})

describe('deleteTag', () => {
  it('expect git command string', async () => {
    const exectedCommand = 'git push origin --delete v1.0.0' 

    await git.deleteTag("v1.0.0", context)
    
    expect(execMock.callCount.get('runCommand')).toBe(1)
    expect(execMock.call.get('runCommand').command).toBe(exectedCommand)
  });
})