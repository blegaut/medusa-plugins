import {
  buildReviewScript,
  detectLanguage,
  resolveVoiceId,
  reviewFieldsRequireAudioInvalidation,
} from '../review-voice-resolver';

describe('review-voice-resolver', () => {
  it('builds english review script without title', () => {
    expect(
      buildReviewScript({
        name: 'Ana',
        content: 'My kid loves them.',
        language: 'en',
      }),
    ).toBe('Ana says: My kid loves them.');
  });

  it('builds spanish review script with comparte intro', () => {
    expect(
      buildReviewScript({
        name: 'Mayra',
        content: 'Nos encantaron para clima caliente.',
        language: 'es',
      }),
    ).toBe('Mayra comparte: Nos encantaron para clima caliente.');
  });

  it('detects spanish text', () => {
    expect(detectLanguage('Excelente calidad, muy cómodos')).toBe('es');
  });

  it('detects english text', () => {
    expect(detectLanguage('Great shoes, very comfortable')).toBe('en');
  });

  it('resolves voice from plugin map', () => {
    const voiceId = resolveVoiceId({
      language: 'es',
      voiceGender: 'female',
      pluginVoices: {
        es: { female: 'voice-es-f', male: 'voice-es-m' },
      },
    });
    expect(voiceId).toBe('voice-es-f');
  });

  it('invalidates when content changes', () => {
    expect(
      reviewFieldsRequireAudioInvalidation(
        { audio_url: 'reviews/audio/x.mp3', content: 'old' },
        { content: 'new' },
      ),
    ).toBe(true);
  });
});
