# semantic-release-recovery

[semantic-release](https://github.com/semantic-release/semantic-release) plugin to recover from a failed deployment. 

Deployment failures can happen for a variety of reasons. It's best to plan for when they happen instead of trying to prevent them from happening in the first place. When you run `semantic-release` to perform a deployment and a failure happens (perhaps the npmjs server is down), unfortunately, you cannot simply click the retry button on your CI server to retry the deployment later. `semantic-release` performs some modifications to your project such as pushing a new git tag to your repository which will then skip a deployment if you perform a retry. 

I believe that retrying should be as easy as, well, retrying. Especially when working on a team, I prefer that they do not need to figure out this behavior of `semantic-release` on their own and instead the deployment process can recover for them. 

# Getting Started

* Install the plugin: `npm install semantic-release-recovery`

* Add to your project workflow: 

```json
{
    "tagFormat": "${version}",
    "branches": [
        "main",
        { "name": "beta", "prerelease": true },
        { "name": "alpha", "prerelease": true }
    ],
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",        
        "@semantic-release/npm", 
        "semantic-release-recovery"
    ]
}
```

* For simple projects, this might be all that you need to do. I suggest reading the section on [creating a recovery plan](#what-recovery-steps-should-my-project-take) to learn more about how to prepare for a failed deployment. 

# What recovery steps should my project take? 

Every project is different for what the deployment process looks like. You will need to decide what needs to be done in order to create a fully automated deployment failure recovery process. Here are some suggestions to help you to create your recovery plan. 

* If `semantic-release` attempted to deploy `2.3.1` of your software and failed, you must delete the git tag `2.3.1` that got pushed to your git repository if you want `semantic-release` to retry pushing `2.3.1` again. That is the main function of this plugin is to delete the git tag if a failure occurs. Although, [you can disable this behavior](#configuration) if needed for some reason. 

* If `semantic-release` successfully pushed version `2.3.1` successfully to a production server such as npmjs.com, you should *not* retry pushing version `2.3.1` to the server again. Most services that you upload to require deployments to be immutable. This plugin cannot help you with this step, however. 

* If `semantic-release` created a git commit for modifications to a `CHANGELOG.md` file, for example, you can revert that git commit, or you can decide not to do anything. Because the git tag that points to the git commit gets deleted, the commit has less of a meaning to it. 

In general, it's up to you to decide what a successful deployment looks like. However, keep in mind that a core requirement of `semantic-release` is that a git tag must be pushed to your git repository in order to determine a deployment was successful. 

# Vision for this project

This project's vision is led by fundamental goals that this plugin is trying to accomplish. With all future development, we try to follow these goals. 

1. When using `semantic-release` with a team, everyone on your team should be able to help retry a deployment. Someone who has never used `semantic-release` before should be able to see a failed deployment and retry it. 
2. Deployment failures should not be scary to recover from. It can be scary to run git commands to recover from a deployment failure. Typos can happen! This plugin should help to prevent the need to run commands manually to avoid anyone on your team needing to feel scared. Let's make deployment failures calm 😄. 

# Why is this plugin needed? 

semantic-release creates and pushes a git tag to your git repository before deployment begins and with no way of disabling it. The community has asked about this a number of times...
* https://github.com/semantic-release/semantic-release/discussions/2027
* https://github.com/semantic-release/semantic-release/issues/2381
* https://github.com/semantic-release/git/issues/405

[The core team believes that it's the responsibility of plugin developers](https://github.com/semantic-release/semantic-release/discussions/2027) to make checks pre-deployment to try to eliminate the possibility of a failed deployment to solve this problem. Although, I would argue that it's not a matter of *if* a deployment will fail, but preparing for *when* a deployment will fail. 

When a deployment fails, the [recommended action](https://github.com/semantic-release/semantic-release/discussions/2027) is to delete the git tag that semantic-release created and try running semantic-release again. However, when working on a team, this has added a lot of confusion. Team members who do not know this tool well, will simply click "retry" on CI server to retry a failed deployment and will notice that a deployment is not retried because the created git tag prevents a deployment retry. 

This plugin tries to solve all of this. When a deployment fails, the plugin attempts to delete the git tag that was created. This should hopefully allow you to simply click "retry" on the CI server to retry a deployment again. Know that retrying a failed deployment could be more complicated then simply deleting a git tag. I suggest reading [what recovery steps your project should take](#what-recovery-steps-should-my-project-take) to learn more about other steps you may need to take. 

# Development 

```
$ nvm use 
$ npm install 
$ npm run test 
```


