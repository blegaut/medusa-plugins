import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { UpdateProductReviewVoiceGenderSchema } from './middlewares';
import { updateProductReviewsWorkflow } from '../../../../../workflows/update-product-reviews';

export const PUT = async (
  req: AuthenticatedMedusaRequest<UpdateProductReviewVoiceGenderSchema>,
  res: MedusaResponse,
) => {
  const review_id = req.params.id;
  const { voice_gender } = req.validatedBody;

  const result = await updateProductReviewsWorkflow(req.scope).run({
    input: {
      productReviews: [
        {
          id: review_id,
          voice_gender,
        },
      ],
    },
  });

  res.status(200).json({ product_review: result.result[0] });
};
