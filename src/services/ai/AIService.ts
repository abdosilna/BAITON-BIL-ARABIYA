import type { AIProvider, AIProviderStatus, AIRequestContext, AIResponse } from './AIProvider';
import { GeminiProviderPlaceholder } from './GeminiProvider.placeholder';
import { MockAIProvider } from './MockAIProvider';
import { OpenAIProviderPlaceholder } from './OpenAIProvider.placeholder';

export type RegisteredProviderId = 'mock' | 'gemini' | 'openai';

export class AIService {
  private providers: Map<RegisteredProviderId, AIProvider>;
  private activeProviderId: RegisteredProviderId = 'mock';

  constructor() {
    this.providers = new Map<RegisteredProviderId, AIProvider>([
      ['mock', new MockAIProvider()],
      ['gemini', new GeminiProviderPlaceholder()],
      ['openai', new OpenAIProviderPlaceholder()],
    ]);
  }

  getActiveProviderId(): RegisteredProviderId {
    return this.activeProviderId;
  }

  setActiveProvider(id: RegisteredProviderId): void {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  getProviderStatus(): AIProviderStatus {
    const provider = this.providers.get(this.activeProviderId) ?? this.providers.get('mock')!;
    return provider.getStatus();
  }

  listProviders(): Array<{ id: RegisteredProviderId; status: AIProviderStatus }> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      status: provider.getStatus(),
    }));
  }

  async ask(context: AIRequestContext): Promise<AIResponse> {
    const provider = this.providers.get(this.activeProviderId) ?? this.providers.get('mock')!;
    const response = await provider.generateReply(context);
    if (!response || !response.content || response.content.trim().length === 0) {
      throw new Error('استلم النظام ردًا فارغًا من مزود المعلم الذكي.');
    }
    return response;
  }
}

export const aiService = new AIService();
