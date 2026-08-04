import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../modules/product-review';
import type ProductReviewService from '../../modules/product-review/service';
import type { UpdateProductReviewInput } from '../../modules/product-review/types/mutations';
import { reviewFieldsRequireAudioInvalidation } from '../../services/review-voice-resolver';
import { invalidateReviewAudio } from '../../utils/invalidate-review-audio';

export const updateProductReviewsStepId = 'update-product-reviews-step';

export const updateProductReviewsStep = createStep(
  updateProductReviewsStepId,
  async (data: UpdateProductReviewInput[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const existingReviews = await productReviewService.listProductReviews(
      { id: data.map((d) => d.id) },
      {
        relations: ['images'],
      },
    );

    for (const update of data) {
      const existing = existingReviews.find((review) => review.id === update.id);
      if (!existing) {
        continue;
      }

      if (reviewFieldsRequireAudioInvalidation(existing as any, update as any)) {
        const reason =
          update.language !== undefined && update.language !== (existing as any).language
            ? 'language_change'
            : update.voice_gender !== undefined &&
                update.voice_gender !== (existing as any).voice_gender
              ? 'gender_change'
              : 'text_change';

        await invalidateReviewAudio(container, existing as any, reason);

        update.audio_url = null;
        update.audio_status = null;
        update.audio_generated_at = null;
      }
    }

    const updatedReviews = await productReviewService.updateProductReviews(data as any[]);

    return new StepResponse(updatedReviews, existingReviews);
  },
  async (data, { container }) => {
    if (!data || !Array.isArray(data)) return;

    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    await productReviewService.updateProductReviews(data as any[]);

    await productReviewService.refreshProductReviewStats(data.map((d) => d.product_id).filter((p) => p !== null));
  },
);
