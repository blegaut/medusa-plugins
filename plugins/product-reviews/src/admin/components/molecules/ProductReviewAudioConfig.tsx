import { Button, Input, Label, Select, toast } from '@medusajs/ui';
import { useState } from 'react';
import { sdk } from '../../lib/client';

type ProductReviewAudioConfigProps = {
  productId: string;
  metadata?: Record<string, unknown> | null;
};

const LANGUAGES = ['es', 'en'] as const;

export const ProductReviewAudioConfig = ({
  productId,
  metadata,
}: ProductReviewAudioConfigProps) => {
  const existingVoices = (metadata?.review_audio_voices || {}) as Record<
    string,
    { female?: string; male?: string }
  >;

  const [defaultLanguage, setDefaultLanguage] = useState(
    (metadata?.review_audio_default_language as string) || 'es',
  );
  const [voices, setVoices] = useState<Record<string, { female: string; male: string }>>({
    es: {
      female: existingVoices.es?.female || '',
      male: existingVoices.es?.male || '',
    },
    en: {
      female: existingVoices.en?.female || '',
      male: existingVoices.en?.male || '',
    },
  });
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      await sdk.admin.products.updateReviewAudioConfig(productId, {
        voices,
        default_language: defaultLanguage,
      });
      toast.success('Review audio config saved');
    } catch (error) {
      toast.error('Failed to save review audio config', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-ui-border-base rounded-lg mb-4">
      <div>
        <h3 className="text-sm font-medium">Review audio voices</h3>
        <p className="text-xs text-ui-fg-subtle mt-1">
          Override ElevenLabs voice IDs per language and gender for this product.
        </p>
      </div>

      <div className="max-w-xs">
        <Label htmlFor="default-language">Default language</Label>
        <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
          <Select.Trigger id="default-language">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {LANGUAGES.map((lang) => (
              <Select.Item key={lang} value={lang}>
                {lang.toUpperCase()}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {LANGUAGES.map((lang) => (
        <div key={lang} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>{lang.toUpperCase()} female voice ID</Label>
            <Input
              value={voices[lang]?.female || ''}
              onChange={(e) =>
                setVoices((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], female: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>{lang.toUpperCase()} male voice ID</Label>
            <Input
              value={voices[lang]?.male || ''}
              onChange={(e) =>
                setVoices((prev) => ({
                  ...prev,
                  [lang]: { ...prev[lang], male: e.target.value },
                }))
              }
            />
          </div>
        </div>
      ))}

      <Button size="small" onClick={save} isLoading={isSaving}>
        Save audio config
      </Button>
    </div>
  );
};
