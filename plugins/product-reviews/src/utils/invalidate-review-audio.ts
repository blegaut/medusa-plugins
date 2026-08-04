import { deleteFilesWorkflow } from '@medusajs/medusa/core-flows';
import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils';
import type { MedusaContainer } from '@medusajs/framework/types';
import { PRODUCT_REVIEW_MODULE } from '../modules/product-review';
import type ProductReviewService from '../modules/product-review/service';

type ReviewWithAudio = {
  id: string;
  audio_url?: string | null;
};

export async function deleteReviewAudioFile(
  container: MedusaContainer,
  audioUrl: string,
): Promise<void> {
  try {
    const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
    const { data: files } = await remoteQuery.graph({
      entity: 'file',
      fields: ['id', 'url'],
      filters: {
        url: audioUrl,
      },
    });

    const file = files?.[0];
    if (file?.id) {
      await deleteFilesWorkflow(container).run({
        input: { ids: [file.id] },
      });
    }
  } catch (error) {
    console.warn('review_audio.invalidate.file_delete_failed', {
      audio_url: audioUrl,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function invalidateReviewAudio(
  container: MedusaContainer,
  review: ReviewWithAudio,
  reason: string,
): Promise<void> {
  if (!review.audio_url) {
    return;
  }

  await deleteReviewAudioFile(container, review.audio_url);

  console.info('review_audio.invalidate', {
    review_id: review.id,
    reason,
  });
}

export async function triggerStorefrontRevalidation(
  container: MedusaContainer,
  productHandle: string,
): Promise<void> {
  const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

  const baseUrl = productReviewService.options?.storefrontRevalidationUrl;
  const secret = productReviewService.options?.storefrontRevalidationSecret;

  if (!baseUrl || !secret || !productHandle) {
    return;
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(`/es/products/${productHandle}`)}`;

  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Storefront revalidation failed (${response.status})`,
      );
    }
  } catch (error) {
    console.warn('review_audio.revalidate.failed', {
      product_handle: productHandle,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
