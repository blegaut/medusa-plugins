import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import { MedusaError, Modules } from '@medusajs/framework/utils';
import type { UpdateProductReviewAudioConfigSchema } from './middlewares';

export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateProductReviewAudioConfigSchema>,
  res: MedusaResponse,
) => {
  const productId = req.params.id;
  const { voices, default_language } = req.validatedBody;

  const productModule = req.scope.resolve(Modules.PRODUCT);
  const product = await productModule.retrieveProduct(productId, {
    select: ['id', 'metadata'],
  });

  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Product ${productId} not found`);
  }

  const metadata = {
    ...(product.metadata || {}),
    ...(voices !== undefined ? { review_audio_voices: voices } : {}),
    ...(default_language !== undefined
      ? { review_audio_default_language: default_language }
      : {}),
  };

  const updated = await productModule.updateProducts(productId, { metadata });

  res.status(200).json({ product: updated });
};
