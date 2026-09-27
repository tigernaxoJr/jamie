import { describe, expect, it } from 'vitest';
import { pickEnglishVoice } from './speech';

const voice = (name: string, lang: string, localService = true) =>
  ({ name, lang, localService }) as SpeechSynthesisVoice;

describe('pickEnglishVoice', () => {
  it('優先選美式英文，其次英式、其他英文', () => {
    const voices = [
      voice('zh', 'zh-TW'),
      voice('uk', 'en-GB'),
      voice('us', 'en-US'),
      voice('au', 'en-AU'),
    ];
    expect(pickEnglishVoice(voices)?.name).toBe('us');
    expect(pickEnglishVoice(voices.filter((v) => v.name !== 'us'))?.name).toBe('uk');
    expect(pickEnglishVoice([voice('au', 'en_AU')])?.name).toBe('au');
  });

  it('同語系時優先裝置內建語音（離線也能用）', () => {
    const voices = [voice('online', 'en-US', false), voice('local', 'en-US', true)];
    expect(pickEnglishVoice(voices)?.name).toBe('local');
  });

  it('沒有英文語音時回傳 null', () => {
    expect(pickEnglishVoice([voice('zh', 'zh-TW'), voice('ja', 'ja-JP')])).toBeNull();
  });
});
