export interface SpeechVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
}

export type SpeechStatus = 'idle' | 'speaking' | 'paused' | 'unsupported' | 'error';

export interface SpeechRecognitionPlaceholder {
  readonly isSupported: boolean;
  startListening(): Promise<string>;
  stopListening(): void;
}

export class SpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private statusListeners = new Set<(status: SpeechStatus) => void>();
  private status: SpeechStatus = 'idle';

  isSynthesisSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  }

  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as Record<string, unknown>;
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  getStatus(): SpeechStatus {
    if (!this.isSynthesisSupported()) return 'unsupported';
    return this.status;
  }

  onStatusChange(listener: (status: SpeechStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private emitStatus(next: SpeechStatus): void {
    this.status = next;
    for (const listener of this.statusListeners) {
      listener(next);
    }
  }

  getAvailableVoices(): SpeechVoiceOption[] {
    if (!this.isSynthesisSupported()) return [];
    try {
      const voices = window.speechSynthesis.getVoices();
      const sorted = [...voices].sort((a, b) => {
        const aIsAr = a.lang.toLowerCase().startsWith('ar') ? 0 : 1;
        const bIsAr = b.lang.toLowerCase().startsWith('ar') ? 0 : 1;
        return aIsAr - bIsAr;
      });
      return sorted.map((v) => ({
        voiceURI: v.voiceURI,
        name: `${v.name} (${v.lang})`,
        lang: v.lang,
      }));
    } catch {
      return [];
    }
  }

  speak(
    text: string,
    options?: { rate?: number; voiceURI?: string }
  ): { started: boolean; reasonAr?: string } {
    const cleanText = text.trim();
    if (!cleanText) {
      return { started: false, reasonAr: 'لا يوجد نص للقراءة.' };
    }

    if (!this.isSynthesisSupported()) {
      this.emitStatus('unsupported');
      return {
        started: false,
        reasonAr: 'القراءة الصوتية غير مدعومة في هذا المتصفح. المحتوى النصي الكامل متاح للقراءة.',
      };
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ar-SA';
      utterance.rate = Math.min(1.8, Math.max(0.6, options?.rate ?? 1.0));

      const voices = window.speechSynthesis.getVoices();
      if (options?.voiceURI) {
        const chosen = voices.find((v) => v.voiceURI === options.voiceURI);
        if (chosen) {
          utterance.voice = chosen;
          utterance.lang = chosen.lang;
        }
      } else {
        const arabicVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ar'));
        if (arabicVoice) {
          utterance.voice = arabicVoice;
          utterance.lang = arabicVoice.lang;
        }
      }

      utterance.onstart = () => this.emitStatus('speaking');
      utterance.onpause = () => this.emitStatus('paused');
      utterance.onresume = () => this.emitStatus('speaking');
      utterance.onend = () => {
        this.currentUtterance = null;
        this.emitStatus('idle');
      };
      utterance.onerror = () => {
        this.currentUtterance = null;
        this.emitStatus('error');
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      this.emitStatus('speaking');
      return { started: true };
    } catch {
      this.emitStatus('error');
      return {
        started: false,
        reasonAr: 'تعذر تشغيل محرك النطق الصوتي؛ يمكنك متابعة قراءة النص مباشرة.',
      };
    }
  }

  pause(): void {
    if (!this.isSynthesisSupported()) return;
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.emitStatus('paused');
      }
    } catch {
      // Ignore unsupported pause
    }
  }

  resume(): void {
    if (!this.isSynthesisSupported()) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.emitStatus('speaking');
      }
    } catch {
      // Ignore
    }
  }

  stop(): void {
    if (!this.isSynthesisSupported()) return;
    try {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.emitStatus('idle');
    } catch {
      this.emitStatus('idle');
    }
  }

  /**
   * Future Speech Recognition hook interface (ready for Phase 2 voice commands).
   */
  getRecognitionPlaceholder(): SpeechRecognitionPlaceholder {
    return {
      isSupported: this.isRecognitionSupported(),
      startListening: async () => {
        throw new Error('التعرف الصوتي (Speech Recognition) مجهز للربط في المرحلة القادمة.');
      },
      stopListening: () => {},
    };
  }
}

export const speechService = new SpeechService();
