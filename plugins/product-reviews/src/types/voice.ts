export type VoiceGender = 'female' | 'male';

export type VoiceMap = Record<string, Partial<Record<VoiceGender, string>>>;

export type ReviewAudioModuleOptions = {
  elevenlabsApiKey?: string;
  defaultLanguage?: string;
  defaultVoiceGender?: VoiceGender;
  voices?: VoiceMap;
  storefrontRevalidationUrl?: string;
  storefrontRevalidationSecret?: string;
};

export type ProductReviewAudioMetadata = {
  review_audio_voices?: VoiceMap;
  review_audio_default_language?: string;
};
