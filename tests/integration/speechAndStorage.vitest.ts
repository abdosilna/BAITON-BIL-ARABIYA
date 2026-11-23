import { describe, expect, it } from 'vitest';
import { SpeechService } from '../../src/services/speech/SpeechService';
import { LocalStorageAdapter } from '../../src/services/storage/LocalStorageAdapter';

describe('SpeechService & LocalStorageAdapter Integration', () => {
  it('handles missing SpeechSynthesis gracefully while preserving text access', () => {
    const speech = new SpeechService();
    const original = (window as unknown as Record<string, unknown>).speechSynthesis;
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      configurable: true,
    });

    expect(speech.isSynthesisSupported()).toBe(false);
    const res = speech.speak('مرحبًا بك في بايتون');
    expect(res.started).toBe(false);
    expect(res.reasonAr).toContain('غير مدعومة');

    Object.defineProperty(window, 'speechSynthesis', {
      value: original,
      configurable: true,
    });
  });

  it('stores and retrieves settings safely in LocalStorageAdapter with fallback on missing keys', () => {
    const storage = new LocalStorageAdapter();
    expect(storage.getItem('missing_key', 42)).toBe(42);
    storage.setItem('theme_test', { fontSize: 16 });
    expect(storage.getItem('theme_test', { fontSize: 14 })).toEqual({ fontSize: 16 });
    storage.removeItem('theme_test');
    expect(storage.getItem('theme_test', { fontSize: 14 })).toEqual({ fontSize: 14 });
  });
});
