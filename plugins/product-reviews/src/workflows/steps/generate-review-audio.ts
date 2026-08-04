import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { MedusaError, Modules } from '@medusajs/framework/utils';
import { PRODUCT_REVIEW_MODULE } from '../../modules/product-review';
import type ProductReviewService from '../../modules/product-review/service';
import { ElevenLabsService } from '../../services/elevenlabs';
import {
  buildReviewScript,
  resolveReviewLanguage,
  resolveVoiceGender,
  resolveVoiceId,
} from '../../services/review-voice-resolver';
import type { ProductReviewAudioMetadata } from '../../types/voice';
import { triggerStorefrontRevalidation } from '../../utils/invalidate-review-audio';

export const generateReviewAudioStepId = 'generate-review-audio-step';

export type GenerateReviewAudioStepInput = {
  review_id: string;
};

export const generateReviewAudioStep = createStep(
  generateReviewAudioStepId,
  async (input: GenerateReviewAudioStepInput, { container }) => {
    const startedAt = Date.now();
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const review = await productReviewService.retrieveProductReview(input.review_id);
    if (!review) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `Review ${input.review_id} not found`);
    }

    await productReviewService.updateProductReviews([
      { id: review.id, audio_status: 'pending' } as any,
    ]);

    try {
      let productMetadata: ProductReviewAudioMetadata | null = null;
      let productHandle: string | undefined;

      if (review.product_id) {
        const productModule = container.resolve(Modules.PRODUCT);
        const product = await productModule.retrieveProduct(review.product_id, {
          select: ['id', 'handle', 'metadata'],
        });
        productMetadata = (product?.metadata || {}) as ProductReviewAudioMetadata;
        productHandle = product?.handle;
      }

      const language = resolveReviewLanguage({
        reviewLanguage: review.language,
        title: review.title,
        content: review.content,
        productMetadata,
        defaultLanguage: productReviewService.defaultLanguage,
      });

      const voiceGender = resolveVoiceGender(
        review.voice_gender,
        productReviewService.defaultVoiceGender,
      );

      const voiceId = resolveVoiceId({
        language,
        voiceGender,
        productVoices: productMetadata?.review_audio_voices,
        pluginVoices: productReviewService.voices,
      });

      const script = buildReviewScript({ ...review, language });
      const elevenLabs = new ElevenLabsService(productReviewService.elevenlabsApiKey!);
      const audioBuffer = await elevenLabs.textToSpeech(script, voiceId);

      const filename = `reviews/audio/${review.id}.mp3`;
      const { result } = await uploadFilesWorkflow(container).run({
        input: {
          files: [
            {
              filename,
              mimeType: 'audio/mpeg',
              // Medusa S3 provider decodes base64; binary/latin1 strings are misread as UTF-8 and corrupt MP3s.
              content: audioBuffer.toString('base64'),
              access: 'public',
            },
          ],
        },
      });

      const uploadedFile = result?.[0];
      const audioUrl = uploadedFile?.url || filename;

      const [updatedReview] = await productReviewService.updateProductReviews([
        {
          id: review.id,
          audio_url: audioUrl,
          audio_status: 'ready',
          audio_generated_at: new Date(),
          language,
          voice_gender: voiceGender,
        } as any,
      ]);

      if (productHandle) {
        await triggerStorefrontRevalidation(container, productHandle);
      }

      console.info('review_audio.generate.success', {
        review_id: review.id,
        language,
        voice_gender: voiceGender,
        voice_id: voiceId,
        duration_ms: Date.now() - startedAt,
      });

      return new StepResponse(updatedReview);
    } catch (error) {
      await productReviewService.updateProductReviews([
        { id: review.id, audio_status: 'failed' } as any,
      ]);

      console.warn('review_audio.generate.failed', {
        review_id: review.id,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
);
