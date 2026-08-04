import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import { generateReviewAudioWorkflow } from '../../../../../workflows/generate-review-audio';

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const review_id = req.params.id;

  const result = await generateReviewAudioWorkflow(req.scope).run({
    input: { review_id },
  });

  res.status(200).json({ product_review: result.result });
};
