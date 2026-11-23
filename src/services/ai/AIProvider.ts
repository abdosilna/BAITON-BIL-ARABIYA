import type { AIMode } from '../../types/database';

export interface AIRequestContext {
  prompt: string;
  mode: AIMode;
  learnerLevel: number;
  codeContext?: string;
  simulateOffline?: boolean;
}

export interface AIResponse {
  content: string;
  isMock: boolean;
  providerName: string;
  suggestedFollowUps: string[];
}

export interface AIProviderStatus {
  connected: boolean;
  modeLabel: string;
  providerName: string;
  noticeAr: string;
}

export interface AIProvider {
  readonly id: string;
  readonly isConnected: boolean;
  readonly providerName: string;
  getStatus(): AIProviderStatus;
  generateReply(context: AIRequestContext): Promise<AIResponse>;
}
