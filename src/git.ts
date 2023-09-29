import { runCommand } from "./exec"
import { BaseContext } from "semantic-release"

export async function deleteTag(tagName: string, dryRun: Boolean, context: BaseContext): Promise<void> {
  let command = `git push origin --delete ${tagName}`
  if (dryRun) command += ` --dry-run`

  await runCommand(command, context)  
}