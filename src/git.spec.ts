import * as exec from "./exec"
import { BaseContext } from 'semantic-release';
import * as git from "./git"

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

describe('deleteTag', () => {
  it('given not running in dry-mode, expect git command string', async () => {
    const exectedCommand = 'git push origin --delete v1.0.0'
    const givenIsInDryMode = false 

    context.options.dryRun = givenIsInDryMode

    jest.spyOn(exec, 'runCommand').mockReturnValue(Promise.resolve())

    await git.deleteTag("v1.0.0", givenIsInDryMode, context)

    expect(exec.runCommand).toHaveBeenCalledWith(exectedCommand, context)
  });

  it('given running in dry-mode, expect git command string', async () => {
    const exectedCommand = 'git push origin --delete v1.0.0 --dry-run'
    const givenIsInDryMode = true

    context.options.dryRun = givenIsInDryMode 

    jest.spyOn(exec, 'runCommand').mockReturnValue(Promise.resolve())

    await git.deleteTag("v1.0.0", givenIsInDryMode, context)

    expect(exec.runCommand).toHaveBeenCalledWith(exectedCommand, context)
  });
})