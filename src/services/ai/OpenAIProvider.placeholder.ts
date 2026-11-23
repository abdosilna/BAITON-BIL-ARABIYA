import type {
  AIProvider,
  AIProviderStatus,
  AIRequestContext,
  AIResponse,
} from './AIProvider';

/**
 * Placeholder provider for future OpenAI integration via server proxy (/api/ai/openai).
 * Intentionally NOT connected in Phase 1. Never expose API keys in frontend code.
 */
export class OpenAIProviderPlaceholder implements AIProvider {
  readonly id = 'openai';
  readonly isConnected = false;
  readonly providerName = 'OpenAI (Not Connected)';

  getStatus(): AIProviderStatus {
    return {
      connected: false,
      modeLabel: 'Not Connected',
      providerName: this.providerName,
      noticeAr: 'مزود OpenAI غير مربوط حاليًا. يتم ربطه لاحقًا عبر Backend Proxy آمن.',
    };
  }

  async generateReply(_context: AIRequestContext): Promise<AIResponse> {
    throw new Error('مزود OpenAI غير مربوط بعد. فعّل MockAIProvider من الإعدادات.');
  }
}
