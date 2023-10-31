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
  it('expect git command string', async () => {
    const exectedCommand = 'git push origin --delete v1.0.0' 

    jest.spyOn(exec, 'runCommand').mockReturnValue(Promise.resolve())

    await git.deleteTag("v1.0.0", context)

    expect(exec.runCommand).toHaveBeenCalledWith(exectedCommand, context)
  });
})