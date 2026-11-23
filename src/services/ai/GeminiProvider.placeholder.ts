import type {
  AIProvider,
  AIProviderStatus,
  AIRequestContext,
  AIResponse,
} from './AIProvider';

/**
 * Placeholder provider for future Google Gemini API integration via server proxy (/api/ai/gemini).
 * Intentionally NOT connected in Phase 1. Never store GEMINI_API_KEY in frontend files.
 */
export class GeminiProviderPlaceholder implements AIProvider {
  readonly id = 'gemini';
  readonly isConnected = false;
  readonly providerName = 'Google Gemini (Not Connected)';

  getStatus(): AIProviderStatus {
    return {
      connected: false,
      modeLabel: 'Not Connected',
      providerName: this.providerName,
      noticeAr: 'مزود Gemini غير مربوط حاليًا. يتم ربطه لاحقًا عبر Backend Proxy آمن.',
    };
  }

  async generateReply(_context: AIRequestContext): Promise<AIResponse> {
    throw new Error('مزود Gemini غير مربوط بعد. فعّل MockAIProvider من الإعدادات.');
  }
}
