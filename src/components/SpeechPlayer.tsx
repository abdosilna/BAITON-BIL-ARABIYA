import { useEffect, useState } from 'react';
import { Pause, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services';
import type { SpeechStatus, SpeechVoiceOption } from '../services/speech/SpeechService';
import { useAppStore } from '../store/useAppStore';

interface SpeechPlayerProps {
  text: string;
  label?: string;
}

export function SpeechPlayer({ text, label = 'الاستماع للشرح' }: SpeechPlayerProps) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [status, setStatus] = useState<SpeechStatus>(() => speechService.getStatus());
  const [voices, setVoices] = useState<SpeechVoiceOption[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const supported = speechService.isSynthesisSupported();

  useEffect(() => {
    const unsub = speechService.onStatusChange(setStatus);
    const loadVoices = () => setVoices(speechService.getAvailableVoices());
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  const handlePlay = () => {
    setNotice(null);
    if (status === 'paused') {
      speechService.resume();
      return;
    }
    const res = speechService.speak(text, {
      rate: settings.speechRate,
      voiceURI: settings.speechVoiceURI || undefined,
    });
    if (!res.started && res.reasonAr) {
      setNotice(res.reasonAr);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#181826] px-3 py-2 text-xs text-[#A1A1B5]">
        <VolumeX className="h-4 w-4 text-[#F59E0B] shrink-0" aria-hidden="true" />
        <span>القراءة الصوتية غير متوفرة في هذا المتصفح — النص الكامل متاح أدناه للقراءة.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#181826] px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs font-medium text-[#F4F4F8]">
        <Volume2 className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {status === 'speaking' ? (
          <button
            type="button"
            onClick={() => speechService.pause()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#272338] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#322D47] whitespace-nowrap shrink-0"
          >
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            <span>إيقاف مؤقت</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePlay}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7C3AED] whitespace-nowrap shrink-0"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{status === 'paused' ? 'استئناف' : 'استماع'}</span>
          </button>
        )}

        {(status === 'speaking' || status === 'paused') && (
          <button
            type="button"
            onClick={() => speechService.stop()}
            aria-label="إيقاف القراءة الصوتية"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-[#A1A1B5] hover:bg-white/5 hover:text-white whitespace-nowrap shrink-0"
          >
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            <span>إيقاف</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
        <label htmlFor="speech-rate-select">السرعة:</label>
        <select
          id="speech-rate-select"
          value={settings.speechRate}
          onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })}
          className="rounded-md border border-white/10 bg-[#101018] px-2 py-1 text-xs text-[#F4F4F8] tabular-nums"
        >
          <option value={0.8}>0.8x</option>
          <option value={1}>1.0x</option>
          <option value={1.2}>1.2x</option>
          <option value={1.5}>1.5x</option>
        </select>
      </div>

      {voices.length > 0 && (
        <select
          aria-label="اختيار الصوت"
          value={settings.speechVoiceURI}
          onChange={(e) => updateSettings({ speechVoiceURI: e.target.value })}
          className="max-w-[180px] truncate rounded-md border border-white/10 bg-[#101018] px-2 py-1 text-xs text-[#F4F4F8]"
        >
          <option value="">الصوت الافتراضي (عربي)</option>
          {voices.slice(0, 12).map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}
            </option>
          ))}
        </select>
      )}

      {notice && <span className="text-xs text-[#F59E0B]">{notice}</span>}
    </div>
  );
}
