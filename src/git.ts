import { exec } from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);

export async function deleteTag(tagName: string, dryRun: Boolean): Promise<string> {
  let args = ["push", "--delete", tagName]  
  if (dryRun) args.push("--dry-run")

  const { stdout, stderr } = await execPromise(`git ${args.join(" ")}`)

  return stdout
}

export default {
  deleteTag
}