import { MedusaError } from '@medusajs/framework/utils';
import type { VoiceGender, VoiceMap, ProductReviewAudioMetadata } from '../types/voice';

export function buildReviewScript(review: {
  name?: string | null;
  content?: string | null;
  language?: string | null;
}): string {
  const name = review.name?.trim() || 'A customer';
  const content = review.content?.trim() || '';
  const intro =
    review.language?.toLowerCase() === 'es' ? `${name} comparte:` : `${name} says:`;

  return `${intro} ${content}`.trim();
}

export function detectLanguage(text: string, fallback = 'es'): string {
  const sample = text.toLowerCase();

  const spanishPattern =
    /[ñáéíóúü]|\b(que|muy|con|para|los|las|está|excelente|zapatos|calidad|hijo|hija|gracias|recomiendo)\b/i;
  const englishPattern =
    /\b(the|and|very|with|great|shoes|quality|son|daughter|thanks|recommend|love|perfect)\b/i;

  const spanishScore = (sample.match(spanishPattern) || []).length;
  const englishScore = (sample.match(englishPattern) || []).length;

  if (englishScore > spanishScore) {
    return 'en';
  }

  if (spanishScore > 0) {
    return 'es';
  }

  return fallback;
}

export function resolveReviewLanguage(input: {
  reviewLanguage?: string | null;
  title?: string | null;
  content?: string | null;
  productMetadata?: ProductReviewAudioMetadata | null;
  defaultLanguage: string;
}): string {
  if (input.reviewLanguage) {
    return input.reviewLanguage;
  }

  const text = `${input.title || ''}. ${input.content || ''}`.trim();
  const fallback =
    input.productMetadata?.review_audio_default_language || input.defaultLanguage;

  if (!text) {
    return fallback;
  }

  return detectLanguage(text, fallback);
}

export function resolveVoiceGender(reviewGender?: VoiceGender | null, defaultGender: VoiceGender = 'female'): VoiceGender {
  return reviewGender || defaultGender;
}

export function resolveVoiceId(input: {
  language: string;
  voiceGender: VoiceGender;
  productVoices?: VoiceMap;
  pluginVoices: VoiceMap;
}): string {
  const lang = input.language.toLowerCase();
  const gender = input.voiceGender;

  const productVoice = input.productVoices?.[lang]?.[gender];
  if (productVoice) {
    return productVoice;
  }

  const pluginVoice = input.pluginVoices[lang]?.[gender];
  if (pluginVoice) {
    return pluginVoice;
  }

  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    `No ElevenLabs voice configured for language "${lang}" and gender "${gender}"`,
  );
}

export function reviewFieldsRequireAudioInvalidation(
  existing: Record<string, unknown>,
  update: Record<string, unknown>,
): boolean {
  if (!existing.audio_url) {
    return false;
  }

  const fields = ['name', 'content', 'language', 'voice_gender'] as const;

  return fields.some((field) => {
    if (update[field] === undefined) {
      return false;
    }
    return update[field] !== existing[field];
  });
}
