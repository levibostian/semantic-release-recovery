import { FailContext, VerifyReleaseContext, VerifyConditionsContext, AnalyzeCommitsContext, GenerateNotesContext, PrepareContext, PublishContext, AddChannelContext, SuccessContext } from "semantic-release"

export interface SemanticReleasePlugin {
  verifyConditions?: (pluginConfig: Object, context: VerifyConditionsContext) => Promise<void>
  analyzeCommits?: (pluginConfig: Object, context: AnalyzeCommitsContext) => Promise<void>
  verifyRelease?: (pluginConfig: Object, context: VerifyReleaseContext) => Promise<void>
  generateNotes?: (pluginConfig: Object, context: GenerateNotesContext) => Promise<void>
  prepare?: (pluginConfig: Object, context: PrepareContext) => Promise<void>
  publish?: (pluginConfig: Object, context: PublishContext) => Promise<void>
  addChannel?: (pluginConfig: Object, context: AddChannelContext) => Promise<void>
  success?: (pluginConfig: Object, context: SuccessContext) => Promise<void>
  fail?: (pluginConfig: Object, context: FailContext) => Promise<void>
}

export class MockSemanticReleasePlugin implements SemanticReleasePlugin {
  verifyConditionsCallCount: number = 0
  verifyConditionsArgs: {pluginConfig: Object, context: VerifyConditionsContext}[] = []
  async verifyConditions(pluginConfig: Object, context: VerifyConditionsContext): Promise<void> {
    this.verifyConditionsCallCount++
    this.verifyConditionsArgs.push({pluginConfig, context})
  }

  analyzeCommitsCallCount: number = 0
  analyzeCommitsArgs: {pluginConfig: Object, context: AnalyzeCommitsContext}[] = []
  async analyzeCommits(pluginConfig: Object, context: AnalyzeCommitsContext): Promise<void> {
    this.analyzeCommitsCallCount++
    this.analyzeCommitsArgs.push({pluginConfig, context})
  }

  verifyReleaseCallCount: number = 0
  verifyReleaseArgs: {pluginConfig: Object, context: VerifyReleaseContext}[] = []
  async verifyRelease(pluginConfig: Object, context: VerifyReleaseContext): Promise<void> {
    this.verifyReleaseCallCount++
    this.verifyReleaseArgs.push({pluginConfig, context})
  }

  generateNotesCallCount: number = 0
  generateNotesArgs: {pluginConfig: Object, context: GenerateNotesContext}[] = []
  async generateNotes(pluginConfig: Object, context: GenerateNotesContext): Promise<void> {
    this.generateNotesCallCount++
    this.generateNotesArgs.push({pluginConfig, context})
  }

  prepareCallCount: number = 0
  prepareArgs: {pluginConfig: Object, context: PrepareContext}[] = []
  async prepare(pluginConfig: Object, context: PrepareContext): Promise<void> {
    this.prepareCallCount++
    this.prepareArgs.push({pluginConfig, context})
  }

  publishCallCount: number = 0
  publishArgs: {pluginConfig: Object, context: PublishContext}[] = []
  async publish(pluginConfig: Object, context: PublishContext): Promise<void> {
    this.publishCallCount++
    this.publishArgs.push({pluginConfig, context})
  }

  addChannelCallCount: number = 0
  addChannelArgs: {pluginConfig: Object, context: AddChannelContext}[] = []
  async addChannel(pluginConfig: Object, context: AddChannelContext): Promise<void> {
    this.addChannelCallCount++
    this.addChannelArgs.push({pluginConfig, context})
  }

  successCallCount: number = 0
  successArgs: {pluginConfig: Object, context: SuccessContext}[] = []
  async success(pluginConfig: Object, context: SuccessContext): Promise<void> {
    this.successCallCount++
    this.successArgs.push({pluginConfig, context})
  }

  failCallCount: number = 0
  failArgs: {pluginConfig: Object, context: FailContext}[] = []
  async fail(pluginConfig: Object, context: FailContext): Promise<void> {
    this.failCallCount++
    this.failArgs.push({pluginConfig, context})
  }
}