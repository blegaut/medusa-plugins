import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { UpdateProductReviewFeaturedForAudioSchema } from './middlewares';
import { updateProductReviewsWorkflow } from '../../../../../workflows/update-product-reviews';

export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateProductReviewFeaturedForAudioSchema>,
  res: MedusaResponse,
) => {
  const review_id = req.params.id;
  const { featured } = req.validatedBody;

  const result = await updateProductReviewsWorkflow(req.scope).run({
    input: {
      productReviews: [
        {
          id: review_id,
          featured_for_audio: featured,
        },
      ],
    },
  });

  res.status(200).json({ product_review: result.result[0] });
};
